import { Agent } from 'agents';
import OpenAI from 'openai';
import type { Env } from './core-utils';
interface QuestionEvaluation {
  id: number;
  question: string;
  studentAnswer: string;
  modelAnswer: string;
  evaluation: 'Correct' | 'Incorrect' | 'Partial';
  score: string;
  reasoning: string;
}
interface EvaluationResult {
  studentName: string;
  paperTitle: string;
  score: number;
  feedbackSummary: string;
  improvementTips: string[];
  questions: QuestionEvaluation[];
}
interface EvaluationState {
  status: 'idle' | 'processing' | 'completed' | 'error';
  studentAnswerText?: string;
  questionPaperText?: string;
  answerKeyText?: string;
  filename?: string;
  tone?: string;
  result?: EvaluationResult;
  error?: string;
}
export class EvaluationAgent extends Agent<Env, EvaluationState> {
  private openai!: OpenAI;
  initialState: EvaluationState = {
    status: 'idle',
  };
  async onStart(): Promise<void> {
    this.openai = new OpenAI({
      baseURL: this.env.CF_AI_BASE_URL,
      apiKey: this.env.CF_AI_API_KEY,
    });
  }
  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/evaluate' && request.method === 'POST') {
      const { studentAnswerText, questionPaperText, answerKeyText, filename, tone } = await request.json<{
        studentAnswerText: string;
        questionPaperText: string;
        answerKeyText: string;
        filename: string;
        tone: string;
      }>();
      this.evaluate(studentAnswerText, questionPaperText, answerKeyText, filename, tone); // Fire-and-forget
      return new Response(JSON.stringify({ success: true, message: 'Evaluation started.' }), { status: 202 });
    }
    if (url.pathname === '/result' && request.method === 'GET') {
      return new Response(JSON.stringify(this.state));
    }
    return new Response('Not Found', { status: 404 });
  }
  async evaluate(studentAnswerText: string, questionPaperText: string, answerKeyText: string, filename: string, tone: string): Promise<void> {
    if (this.state.status === 'processing') {
      console.log(`Evaluation for ${this.name} already in progress.`);
      return;
    }
    this.setState({ ...this.initialState, status: 'processing', studentAnswerText, questionPaperText, answerKeyText, filename, tone });
    try {
      const prompt = this.constructPrompt(studentAnswerText, questionPaperText, answerKeyText, filename, tone);
      const completion = await this.openai.chat.completions.create({
        model: 'google-ai-studio/gemini-2.5-flash',
        messages: [{ role: 'system', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });
      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error('AI returned empty content.');
      }
      const result = JSON.parse(content) as EvaluationResult;
      this.setState({ ...this.state, status: 'completed', result });
    } catch (error) {
      console.error(`[EvaluationAgent ${this.name}] AI evaluation failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during AI evaluation.';
      this.setState({ ...this.state, status: 'error', error: errorMessage });
    }
  }
  private getToneInstruction(tone: string): string {
    switch (tone) {
      case 'friendly':
        return "Your feedback summary and improvement tips should be written in a friendly, encouraging, and supportive tone. Use positive language.";
      case 'motivational':
        return "Your feedback summary and improvement tips should be highly motivational and inspiring. Focus on the student's potential for growth and excellence.";
      case 'formal':
      default:
        return "Your feedback summary and improvement tips should be formal, objective, and professional, suitable for an academic setting.";
    }
  }
  private constructPrompt(studentAnswerText: string, questionPaperText: string, answerKeyText: string, filename: string, tone: string): string {
    const toneInstruction = this.getToneInstruction(tone);
    return `
      You are an expert AI teacher's assistant. Your task is to evaluate a student's answer sheet with high accuracy by cross-referencing it with the question paper and the model answer key.
      The student's submission is for a paper titled "${filename}".
      You have been provided with three documents:
      1. The Question Paper
      2. The Model Answer Key
      3. The Student's Answer Sheet
      --- QUESTION PAPER ---
      ${questionPaperText}
      --- END OF QUESTION PAPER ---
      --- MODEL ANSWER KEY ---
      ${answerKeyText}
      --- END OF MODEL ANSWER KEY ---
      --- STUDENT'S ANSWER SHEET ---
      ${studentAnswerText}
      --- END OF STUDENT'S ANSWER SHEET ---
      Please perform the following tasks with precision:
      1.  **Analyze and Correlate**: Read the Question Paper to understand the questions. Read the Student's Answer Sheet to find their answers. Use the Model Answer Key as the ground truth for evaluation.
      2.  **Evaluate Each Question**: For each question from the question paper, compare the student's corresponding answer with the model answer.
      3.  **Score**: Assign a total score out of 100 for the entire paper based on the correctness of all answers.
      4.  **Summarize and Suggest Improvements**: Provide a concise, constructive overall feedback summary and 3-5 specific, actionable improvement tips. ${toneInstruction}
      Your response MUST be a single, valid JSON object. Do not include any text or markdown formatting outside of the JSON object.
      The JSON object must follow this exact structure:
      {
        "studentName": "Anonymous Student",
        "paperTitle": "${filename}",
        "score": <integer, 0-100>,
        "feedbackSummary": "<string, overall feedback>",
        "improvementTips": [
          "<string, tip 1>",
          "<string, tip 2>",
          "<string, tip 3>"
        ],
        "questions": [
          {
            "id": 1,
            "question": "<string, question 1 from the question paper>",
            "studentAnswer": "<string, student's answer to question 1>",
            "modelAnswer": "<string, model answer for question 1 from the answer key>",
            "evaluation": "<'Correct' | 'Incorrect' | 'Partial'>",
            "score": "<string, e.g., '8/10'>",
            "reasoning": "<string, brief explanation for the evaluation, comparing student's answer to the model answer>"
          }
        ]
      }
      Ensure all fields are populated accurately based on the provided documents.
    `;
  }
}