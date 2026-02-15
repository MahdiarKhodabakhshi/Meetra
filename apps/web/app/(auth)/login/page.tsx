'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
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
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your email and password to access your account.</CardDescription>
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          error={error && error.toLowerCase().includes('password') ? error : undefined}
        />
        {error && !error.toLowerCase().includes('email') && !error.toLowerCase().includes('password') && (
          <p className="text-sm text-[var(--destructive)]" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" fullWidth loading={loading} disabled={isLoading}>
          Sign in
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="link">
          Register
        </Link>
      </p>
    </Card>
  );
}
