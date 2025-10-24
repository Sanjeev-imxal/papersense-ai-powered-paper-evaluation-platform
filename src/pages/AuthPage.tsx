import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, LogIn } from 'lucide-react';
import { useAppStore } from '@/lib/store';
const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);
  const handleLogin = (role: 'student' | 'teacher') => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      login(role);
      navigate('/app');
      setIsLoading(false);
    }, 1000);
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-papersense-secondary/50 p-4">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,white_5%,transparent_50%)] dark:bg-grid-slate-700/40"></div>
      <Card className="mx-auto max-w-sm w-full z-10 shadow-xl animate-fade-in">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <BookOpen className="w-10 h-10 text-papersense-primary" />
            <h1 className="text-3xl font-bold text-papersense-primary">PaperSense</h1>
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-papersense-primary hover:bg-papersense-primary/90" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue as
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => handleLogin('student')} disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" /> Student
              </Button>
              <Button variant="outline" onClick={() => handleLogin('teacher')} disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" /> Teacher
              </Button>
            </div>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="#" className="underline">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default AuthPage;