'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.ok) setError(result.error ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-[var(--background)]">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your Meetra account to continue networking.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          error={error && error.toLowerCase().includes('email') ? error : undefined}
        />
        <Input
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          error={error && error.toLowerCase().includes('password') ? error : undefined}
        />
        {error &&
          !error.toLowerCase().includes('email') &&
          !error.toLowerCase().includes('password') && (
            <p className="text-sm text-[var(--destructive)]" role="alert">
              {error}
            </p>
          )}
        <Button type="submit" fullWidth loading={loading} className="btn-gradient">
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="link font-medium">
          Create one free
        </Link>
      </p>
    </Card>
  );
}
