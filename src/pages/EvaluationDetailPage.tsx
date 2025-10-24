import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckCircle, XCircle, Download, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
const EvaluationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const evaluation = useAppStore((state) =>
    state.evaluations.find((e) => e.id === id)
  );
  const updateEvaluation = useAppStore((state) => state.updateEvaluation);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (evaluation?.status === 'Processing') {
      const interval = setInterval(async () => {
        try {
          if (!id) return;
          const response = await fetch(`/api/evaluation/${id}`);
          if (!response.ok) throw new Error('Failed to fetch status');
          const { data } = await response.json();
          if (data.status === 'completed') {
            clearInterval(interval);
            updateEvaluation(id, {
              status: 'Completed',
              score: data.result.score,
              feedbackSummary: data.result.feedbackSummary,
              improvementTips: data.result.improvementTips,
              questions: data.result.questions,
            });
            toast.success("Evaluation complete!", { description: "Your results are now available." });
          } else if (data.status === 'error') {
            clearInterval(interval);
            updateEvaluation(id, { status: 'Error', error: data.error });
            toast.error("Evaluation failed.", { description: data.error });
          }
        } catch (error) {
          console.error("Polling error:", error);
          clearInterval(interval);
          if (id) {
            updateEvaluation(id, { status: 'Error', error: 'Failed to connect to the server.' });
          }
        }
      }, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [evaluation, id, updateEvaluation]);
  const handleDownloadPdf = async () => {
    if (!reportRef.current || !evaluation) return;
    setIsGeneratingPdf(true);
    toast.info("Generating PDF report...", { description: "This may take a moment." });
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`PaperSense_Report_${evaluation.title.replace(/\s/g, '_')}.pdf`);
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF", { description: "An unexpected error occurred." });
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  if (!evaluation) {
    return (
      <MainLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Evaluation not found.</h1>
          <p className="text-muted-foreground">It might have been deleted or the link is incorrect.</p>
        </div>
      </MainLayout>
    );
  }
  if (evaluation.status === 'Processing') {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center text-center space-y-4 p-8">
          <Loader2 className="h-16 w-16 animate-spin text-papersense-primary" />
          <h1 className="text-3xl font-bold">AI Evaluation in Progress</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Our AI is carefully reviewing your submission. This page will automatically update when the results are ready.
          </p>
          <Skeleton className="h-12 w-64 mt-4" />
          <div className="w-full max-w-3xl space-y-4 mt-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }
  if (evaluation.status === 'Error') {
    return (
       <MainLayout>
        <div className="flex flex-col items-center justify-center text-center space-y-4 p-8">
          <AlertTriangle className="h-16 w-16 text-destructive" />
          <h1 className="text-3xl font-bold">An Error Occurred</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            We're sorry, but something went wrong during the evaluation.
          </p>
          <Card className="mt-4 text-left">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive-foreground bg-destructive/20 p-3 rounded-md">{evaluation.error || 'Unknown error.'}</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }
  return (
    <MainLayout>
      <div ref={reportRef} className="space-y-8 animate-fade-in p-4 bg-background">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-papersense-primary">{evaluation.title}</h1>
            <p className="text-lg text-muted-foreground">Evaluation submitted on {evaluation.date}</p>
          </div>
          <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
            {isGeneratingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isGeneratingPdf ? 'Generating...' : 'Download Report'}
          </Button>
        </header>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Side-by-Side Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {evaluation.questions?.map((q, index) => (
                  <div key={q.id}>
                    <div className="p-4 bg-muted/50 rounded-t-lg">
                      <p className="font-semibold">Question {q.id}: {q.question}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-px bg-border">
                      <div className="p-4 bg-background">
                        <h3 className="font-semibold mb-2">Your Answer</h3>
                        <p className="text-sm">{q.studentAnswer}</p>
                      </div>
                      <div className="p-4 bg-background">
                        <h3 className="font-semibold mb-2">Model Answer</h3>
                        <p className="text-sm">{q.modelAnswer}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-muted/50 rounded-b-lg">
                      <Badge variant={q.evaluation === 'Correct' ? 'default' : 'destructive'} className={q.evaluation === 'Correct' ? 'bg-green-500/80' : ''}>
                        {q.evaluation === 'Correct' ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                        {q.evaluation}
                      </Badge>
                      <span className="font-bold text-sm">Score: {q.score}</span>
                    </div>
                    {index < (evaluation.questions?.length ?? 0) - 1 && <Separator className="my-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Overall Score</CardTitle>
                <div className="text-6xl font-bold text-papersense-primary">{evaluation.score}
                  <span className="text-3xl text-muted-foreground">/100</span>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>AI Feedback Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{evaluation.feedbackSummary}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="text-yellow-500" />
                  Improvement Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {evaluation.improvementTips?.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default EvaluationDetailPage;