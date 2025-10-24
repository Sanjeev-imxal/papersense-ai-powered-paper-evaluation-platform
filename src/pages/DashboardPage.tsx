import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import MainLayout from '@/components/layout/MainLayout';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
const DashboardPage = () => {
  const user = useAppStore((state) => state.user);
  const evaluations = useAppStore((state) => state.evaluations);
  const updateEvaluation = useAppStore((state) => state.updateEvaluation);
  useEffect(() => {
    const processingEvaluations = evaluations.filter(e => e.status === 'Processing');
    if (processingEvaluations.length === 0) {
      return;
    }
    const intervalIds: NodeJS.Timeout[] = [];
    processingEvaluations.forEach(evaluation => {
      const intervalId = setInterval(async () => {
        try {
          if (!evaluation.id) return;
          const response = await fetch(`/api/evaluation/${evaluation.id}`);
          if (!response.ok) {
            // Stop polling on server error to avoid spamming
            clearInterval(intervalId);
            return;
          }
          const { data } = await response.json();
          if (data.status === 'completed') {
            clearInterval(intervalId);
            updateEvaluation(evaluation.id, {
              status: 'Completed',
              score: data.result.score,
              feedbackSummary: data.result.feedbackSummary,
              improvementTips: data.result.improvementTips,
              questions: data.result.questions,
            });
            toast.success(`"${evaluation.title}" has been evaluated!`, {
              description: "The results are now available on your dashboard.",
            });
          } else if (data.status === 'error') {
            clearInterval(intervalId);
            updateEvaluation(evaluation.id, { status: 'Error', error: data.error });
            toast.error(`Evaluation failed for "${evaluation.title}"`, {
              description: data.error || "An unknown error occurred.",
            });
          }
          // If still processing, do nothing and wait for the next interval
        } catch (error) {
          console.error(`Polling error for evaluation ${evaluation.id}:`, error);
          clearInterval(intervalId); // Stop polling on network or parsing error
        }
      }, 5000); // Poll every 5 seconds
      intervalIds.push(intervalId);
    });
    // Cleanup function to clear all intervals when the component unmounts
    // or when the list of evaluations changes.
    return () => {
      intervalIds.forEach(id => clearInterval(id));
    };
  }, [evaluations, updateEvaluation]);
  if (!user) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      {user.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
    </MainLayout>
  );
};
export default DashboardPage;