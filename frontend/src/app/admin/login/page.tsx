'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Compass, LogIn } from 'lucide-react';
import { login, signup } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      localStorage.setItem('mxpertz_token', result.token);
      localStorage.setItem('mxpertz_user_email', result.user.email);

      toast({
        title: 'Login Successful',
        description: 'Redirecting to dashboard...',
      });

      router.push('/admin/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid email or password.',
      });
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Email and password are required.',
      });
      return;
    }

    setIsCreatingAccount(true);

    try {
      const result = await signup(email, password);
      toast({
        title: 'Account Created',
        description: result.message,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error instanceof Error ? error.message : 'Unable to create account.',
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
             <div className="flex justify-center items-center gap-2 mb-2">
                <Compass className="h-10 w-10 text-accent" />
                <h1 className="font-headline text-3xl font-bold text-primary">Course Compass</h1>
             </div>
            <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
              {!isLoading && <LogIn className="ml-2 h-4 w-4" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              disabled={isLoading || isCreatingAccount}
              onClick={handleSignup}
            >
              {isCreatingAccount ? 'Creating Account...' : 'Create Admin Account'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
