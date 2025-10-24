import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";
import { useAppStore } from "@/lib/store";
const StudentDashboard = () => {
  const user = useAppStore((state) => state.user);
  const evaluations = useAppStore((state) => state.evaluations);
  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-papersense-primary">Welcome, {user?.name}!</h1>
          <p className="text-lg text-muted-foreground">Here are your recent submissions and results.</p>
        </div>
        <Button asChild size="lg" className="bg-papersense-accent hover:bg-papersense-accent/90 text-papersense-accent-foreground">
          <Link to="/app/upload">
            <Upload className="mr-2 h-5 w-5" /> Upload New Paper
          </Link>
        </Button>
      </header>
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle>My Submissions</CardTitle>
          <CardDescription>Click on a paper to view detailed feedback.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <Link to={`/app/evaluation/${evaluation.id}`} key={evaluation.id} className="block">
                <div className="border p-4 rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-papersense-primary" />
                    <div>
                      <p className="font-semibold">{evaluation.title}</p>
                      <p className="text-sm text-muted-foreground">Submitted on {evaluation.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {evaluation.status === 'Completed' ? (
                      <>
                        <p className="text-2xl font-bold text-papersense-primary">{evaluation.score}</p>
                        <p className="text-sm text-muted-foreground">Score</p>
                      </>
                    ) : (
                      <p className="text-lg font-medium text-yellow-600">{evaluation.status}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default StudentDashboard;