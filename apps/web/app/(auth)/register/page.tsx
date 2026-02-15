'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const result = await register(email, password, name || undefined);
      if (!result.ok) setError(result.error ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Register with your email to join events and get matches.</CardDescription>
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
        />
        <Input
          type="text"
          label="Name (optional)"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <Input
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          hint="Minimum 8 characters."
        />
        {error && (
          <p className="text-sm text-[var(--destructive)]" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" fullWidth loading={loading} disabled={isLoading}>
          Register
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        Already have an account?{' '}
        <Link href="/login" className="link">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
