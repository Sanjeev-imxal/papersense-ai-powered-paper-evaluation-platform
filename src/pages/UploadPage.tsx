import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { useAppStore, Evaluation } from '@/lib/store';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { UploadCloud, CheckCircle, XCircle, Loader2, FileText, FileQuestion, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
type OcrStatus = 'idle' | 'processing' | 'success' | 'error';
interface FileState {
  file: File | null;
  status: OcrStatus;
  progress: number;
  progressText: string;
  extractedText: string | null;
}
const initialFileState: FileState = {
  file: null,
  status: 'idle',
  progress: 0,
  progressText: '',
  extractedText: null,
};
const FileDropzone = ({
  fileState,
  onDrop,
  title,
  description,
  icon,
  isProcessing,
}: {
  fileState: FileState;
  onDrop: (acceptedFiles: File[]) => void;
  title: string;
  description: string;
  icon: React.ReactNode;
  isProcessing: boolean;
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isProcessing || fileState.status !== 'idle',
  });
  if (fileState.status !== 'idle') {
    return (
      <div className="border p-4 rounded-lg flex items-center justify-between bg-muted/50">
        <div className="flex items-center gap-4">
          {icon}
          <div>
            <p className="font-semibold">{fileState.file?.name}</p>
            <p className="text-sm text-muted-foreground">{fileState.progressText || title}</p>
          </div>
        </div>
        {fileState.status === 'processing' && <Loader2 className="h-6 w-6 text-papersense-primary animate-spin" />}
        {fileState.status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
        {fileState.status === 'error' && <XCircle className="h-6 w-6 text-destructive" />}
      </div>
    );
  }
  return (
    <div {...getRootProps()} className={cn('border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-300', isDragActive ? 'border-papersense-primary bg-papersense-primary/10' : 'border-muted-foreground/50 hover:border-papersense-primary')}>
      <input {...getInputProps()} />
      <div className="mx-auto w-fit mb-2">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
const UploadPage = () => {
  const [studentAnswer, setStudentAnswer] = useState<FileState>(initialFileState);
  const [questionPaper, setQuestionPaper] = useState<FileState>(initialFileState);
  const [answerKey, setAnswerKey] = useState<FileState>(initialFileState);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [tone, setTone] = useState('formal');
  const addEvaluation = useAppStore((state) => state.addEvaluation);
  const navigate = useNavigate();
  const handleOcr = useCallback(async (
    uploadedFile: File,
    setFileState: React.Dispatch<React.SetStateAction<FileState>>
  ) => {
    setFileState(prev => ({ ...prev, file: uploadedFile, status: 'processing', progress: 0, progressText: 'Initializing...' }));
    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const p = Math.floor(m.progress * 100);
            setFileState(prev => ({ ...prev, progress: p, progressText: `Recognizing Text: ${p}%` }));
          } else {
            const formattedStatus = m.status.charAt(0).toUpperCase() + m.status.slice(1);
            setFileState(prev => ({ ...prev, progressText: formattedStatus.replace(/_/g, ' ') + '...' }));
          }
        },
      });
      const { data: { text } } = await worker.recognize(uploadedFile);
      await worker.terminate();
      setFileState(prev => ({ ...prev, status: 'success', progress: 100, progressText: 'OCR Complete!', extractedText: text }));
      toast.success(`${uploadedFile.name} processed successfully.`);
    } catch (err) {
      console.error(err);
      setFileState(prev => ({ ...prev, status: 'error', progressText: 'OCR Failed' }));
      toast.error('OCR Processing Failed', { description: 'Please try again with a clearer image.' });
    }
  }, []);
  const allFilesProcessed = useMemo(() =>
    studentAnswer.status === 'success' && questionPaper.status === 'success' && answerKey.status === 'success',
    [studentAnswer, questionPaper, answerKey]
  );
  const handleStartEvaluation = async () => {
    if (!allFilesProcessed || !studentAnswer.extractedText || !questionPaper.extractedText || !answerKey.extractedText || !studentAnswer.file) {
      toast.error("Missing Files or OCR Data", { description: "Please ensure all three files are uploaded and processed successfully." });
      return;
    }
    setIsEvaluating(true);
    toast.info("Starting AI Evaluation...", { description: "This may take a moment." });
    const newEvaluation: Evaluation = {
      id: crypto.randomUUID(),
      title: studentAnswer.file.name,
      status: 'Processing',
      date: new Date().toISOString().split('T')[0],
    };
    addEvaluation(newEvaluation);
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAnswerText: studentAnswer.extractedText,
          questionPaperText: questionPaper.extractedText,
          answerKeyText: answerKey.extractedText,
          filename: studentAnswer.file.name,
          evaluationId: newEvaluation.id,
          tone: tone,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to start evaluation.');
      }
      toast.success('Evaluation started!', { description: 'You will be redirected to your dashboard.' });
      setTimeout(() => navigate('/app/dashboard'), 2000);
    } catch (error) {
      console.error(error);
      toast.error("Evaluation Failed", { description: "Could not send data to the server." });
      setIsEvaluating(false);
    }
  };
  const isProcessingAnyFile = studentAnswer.status === 'processing' || questionPaper.status === 'processing' || answerKey.status === 'processing';
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-3xl">Comprehensive Paper Evaluation</CardTitle>
            <CardDescription>Upload the question paper, the official answer key, and the student's answer sheet for the most accurate AI evaluation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileDropzone
              fileState={questionPaper}
              onDrop={(files) => handleOcr(files[0], setQuestionPaper)}
              title="1. Question Paper"
              description="Provides context for the questions."
              icon={<FileQuestion className="h-8 w-8 text-papersense-primary" />}
              isProcessing={isProcessingAnyFile}
            />
            <FileDropzone
              fileState={answerKey}
              onDrop={(files) => handleOcr(files[0], setAnswerKey)}
              title="2. Model Answer Key"
              description="The ground truth for grading."
              icon={<KeyRound className="h-8 w-8 text-papersense-primary" />}
              isProcessing={isProcessingAnyFile}
            />
            <FileDropzone
              fileState={studentAnswer}
              onDrop={(files) => handleOcr(files[0], setStudentAnswer)}
              title="3. Student's Answer Sheet"
              description="The scanned paper to be graded."
              icon={<FileText className="h-8 w-8 text-papersense-primary" />}
              isProcessing={isProcessingAnyFile}
            />
            <div className="space-y-3 !mt-8">
              <Label className="font-semibold text-base">Select Feedback Tone</Label>
              <RadioGroup defaultValue="formal" value={tone} onValueChange={setTone} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Formal', 'Friendly', 'Motivational'].map((toneName) => (
                  <div key={toneName}>
                    <RadioGroupItem value={toneName.toLowerCase()} id={toneName.toLowerCase()} className="peer sr-only" />
                    <Label
                      htmlFor={toneName.toLowerCase()}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-papersense-primary [&:has([data-state=checked])]:border-papersense-primary cursor-pointer transition-colors"
                    >
                      {toneName}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="pt-4">
              <Button
                size="lg"
                className="w-full bg-papersense-accent hover:bg-papersense-accent/90 text-papersense-accent-foreground"
                disabled={!allFilesProcessed || isProcessingAnyFile || isEvaluating}
                onClick={handleStartEvaluation}
              >
                {isEvaluating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isEvaluating ? 'Evaluating...' : 'Start AI Evaluation'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};
export default UploadPage;