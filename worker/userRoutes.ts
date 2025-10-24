import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { Env } from "./core-utils";
import { ChatAgent } from "./agent";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // PaperSense: New endpoint for handling OCR text submissions
    app.post('/api/evaluate', async (c) => {
        try {
            const body = await c.req.json<{
                studentAnswerText: string;
                questionPaperText: string;
                answerKeyText: string;
                filename: string;
                evaluationId: string;
                tone: string;
            }>();
            const { studentAnswerText, questionPaperText, answerKeyText, filename, evaluationId, tone } = body;
            if (!studentAnswerText || !questionPaperText || !answerKeyText || !evaluationId) {
                return c.json({ success: false, error: 'All three documents and an evaluationId are required.' }, { status: 400 });
            }
            // Use the evaluationId from the client to get the correct agent instance
            const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, evaluationId);
            // Fire-and-forget the evaluation process
            c.executionCtx.waitUntil(agent.fetch(new Request(new URL(c.req.url).origin + '/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentAnswerText, questionPaperText, answerKeyText, filename, tone }),
            })));
            return c.json({ success: true, message: 'Evaluation process started.', evaluationId });
        } catch (error) {
            console.error('Failed to process evaluation request:', error);
            return c.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
        }
    });
    // PaperSense: New endpoint for polling evaluation status
    app.get('/api/evaluation/:id', async (c) => {
        try {
            const { id } = c.req.param();
            const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, id);
            const response = await agent.fetch(new URL(c.req.url).origin + '/result');
            if (!response.ok) {
                throw new Error(`Agent returned status ${response.status}`);
            }
            const data = await response.json();
            return c.json({ success: true, data });
        } catch (error) {
            console.error(`Failed to get evaluation status for ${c.req.param('id')}:`, error);
            return c.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
        }
    });
    // Add your routes here
    // Example route - you can remove this
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'this works' }}));
    // ��� AI Extension Point: Add more custom routes here
}
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // This function is required to satisfy an import in a locked file.
}