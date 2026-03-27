'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CSSProperties, FormEvent } from 'react';
import { useState } from 'react';
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
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to continue your AWS exam prep journey.</p>

        <form onSubmit={(event) => { void handleSubmit(event); }} style={styles.form}>
          <label style={styles.label} htmlFor='email'>
            Email
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder='you@example.com'
            style={styles.input}
            autoComplete='email'
            required
          />

          <label style={styles.label} htmlFor='password'>
            Password
          </label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder='At least 8 characters'
            style={styles.input}
            autoComplete='current-password'
            required
          />

          {error ? <p style={styles.error}>{error}</p> : null}

          <button type='submit' disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={styles.footerText}>
          New here? <Link href='/auth/sign-up'>Create an account</Link>
        </p>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100dvh',
    display: 'grid',
    placeItems: 'center',
    padding: '2rem',
    boxSizing: 'border-box',
    background: 'linear-gradient(140deg, #f7f4ec 0%, #d9e8ff 100%)',
    fontFamily: 'ui-rounded, system-ui, sans-serif',
  },
  card: {
    width: 'min(100%, 460px)',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(9, 38, 89, 0.14)',
    border: '1px solid #d6e2f2',
    padding: '2rem',
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    color: '#12305f',
  },
  subtitle: {
    margin: '0.5rem 0 1.5rem',
    color: '#4a5b78',
  },
  form: {
    display: 'grid',
    gap: '0.75rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#1f355b',
  },
  input: {
    border: '1px solid #b8c7dd',
    borderRadius: '10px',
    padding: '0.7rem 0.8rem',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    marginTop: '0.25rem',
    border: 0,
    borderRadius: '10px',
    backgroundColor: '#0f4c81',
    color: '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    padding: '0.75rem',
    cursor: 'pointer',
  },
  error: {
    margin: '0.25rem 0',
    color: '#b42318',
    fontSize: '0.92rem',
  },
  footerText: {
    marginTop: '1.5rem',
    color: '#304566',
  },
};
