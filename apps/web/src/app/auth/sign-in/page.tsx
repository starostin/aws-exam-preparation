'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signInSchema } from '@/lib/validation/auth';
import { signInWithEmailPassword, syncUserProfile } from '@/lib/auth/auth-service';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your input');
      return;
    }

    setIsSubmitting(true);
    try {
      const authData = await signInWithEmailPassword(parsed.data.email, parsed.data.password);
      const accessToken = authData.session?.access_token;

      if (!accessToken) {
        throw new Error('Missing access token from sign-in session');
      }

      await syncUserProfile(accessToken);
      router.push('/');
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Unable to sign in right now';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className='grid min-h-screen place-items-center px-4 py-8'>
      <Card className='w-full max-w-md border-border/70 bg-card/80'>
        <CardHeader>
          <CardTitle className='text-3xl text-foreground'>Welcome back</CardTitle>
          <CardDescription className='text-muted-foreground'>Sign in to continue your AWS exam prep journey.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={(event) => { void handleSubmit(event); }} className='grid gap-3'>
            <label className='text-sm font-semibold text-foreground' htmlFor='email'>
              Email
            </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder='you@example.com'
            className='h-10 rounded-md border border-input bg-background/70 px-3 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring'
            autoComplete='email'
            required
          />

            <label className='text-sm font-semibold text-foreground' htmlFor='password'>
              Password
            </label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder='At least 8 characters'
            className='h-10 rounded-md border border-input bg-background/70 px-3 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring'
            autoComplete='current-password'
            required
          />

            {error ? <p className='text-sm text-destructive'>{error}</p> : null}

            <Button type='submit' disabled={isSubmitting} className='mt-1 w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300'>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className='mt-5 text-sm text-muted-foreground'>
            New here? <Link className='text-cyan-600 hover:text-cyan-500 dark:text-cyan-300 dark:hover:text-cyan-200' href='/auth/sign-up'>Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
