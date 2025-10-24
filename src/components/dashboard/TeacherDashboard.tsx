import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Users, CheckCircle, Percent } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Link } from "react-router-dom";
import { useMemo } from "react";
const TeacherDashboard = () => {
  const user = useAppStore((state) => state.user);
  const evaluations = useAppStore((state) => state.evaluations);
  const stats = useMemo(() => {
    const graded = evaluations.filter(e => e.status === 'Completed' && e.score !== undefined);
    const totalSubmissions = evaluations.length;
    const gradedCount = graded.length;
    const averageScore = graded.length > 0 ? graded.reduce((acc, curr) => acc + (curr.score ?? 0), 0) / graded.length : 0;
    const completion = totalSubmissions > 0 ? (gradedCount / totalSubmissions) * 100 : 0;
    return {
      totalSubmissions,
      gradedCount,
      averageScore,
      completion,
    };
  }, [evaluations]);
  const marksDistribution = useMemo(() => {
    const distribution = [
      { name: '0-20', count: 0 },
      { name: '21-40', count: 0 },
      { name: '41-60', count: 0 },
      { name: '61-80', count: 0 },
      { name: '81-100', count: 0 },
    ];
    evaluations.forEach(e => {
      if (e.score !== undefined) {
        if (e.score <= 20) distribution[0].count++;
        else if (e.score <= 40) distribution[1].count++;
        else if (e.score <= 60) distribution[2].count++;
        else if (e.score <= 80) distribution[3].count++;
        else distribution[4].count++;
      }
    });
    return distribution;
  }, [evaluations]);
  const submissionStatusData = useMemo(() => [
    { name: 'Graded', value: stats.gradedCount },
    { name: 'Pending', value: stats.totalSubmissions - stats.gradedCount },
  ], [stats]);
  const COLORS = ['#0088FE', '#FFBB28'];
  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-4xl font-bold text-papersense-primary">Welcome, {user?.name}!</h1>
        <p className="text-lg text-muted-foreground">Here's an overview of your class performance.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Mock data: 2 classes</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">For graded papers</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grading Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completion.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">{stats.gradedCount} of {stats.totalSubmissions} graded</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Marks Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marksDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--papersense-primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Submission Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={submissionStatusData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {submissionStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paper Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.length > 0 ? evaluations.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link to={`/app/evaluation/${sub.id}`} className="hover:underline text-papersense-primary">{sub.title}</Link>
                  </TableCell>
                  <TableCell>{sub.date}</TableCell>
                  <TableCell>{sub.score ?? 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={sub.status === 'Completed' ? 'default' : 'secondary'} className={sub.status === 'Completed' ? 'bg-green-500/80' : 'bg-yellow-500/80'}>
                      {sub.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">No submissions yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
export default TeacherDashboard;