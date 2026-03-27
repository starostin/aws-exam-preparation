'use client';

import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { signOutCurrentUser } from '@/lib/auth/auth-service';

export default function HomePage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const { data, error: userError } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      setEmail(data.user?.email ?? null);
      setLoading(false);
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  async function handleSignOut() {
    setError(null);
    try {
      await signOutCurrentUser();
      setEmail(null);
      router.push('/auth/sign-in');
      router.refresh();
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Could not sign out');
    }
  }

  if (loading) {
    return <main style={styles.page}>Loading...</main>;
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>AWS Exam Preparation</h1>
            <p style={styles.subtitle}>Your main study dashboard</p>
          </div>

          <div style={styles.headerRight}>
            <span style={styles.emailLabel}>{email ?? 'No user email found'}</span>
            <button type='button' onClick={() => { void handleSignOut(); }} style={styles.button}>
              Sign out
            </button>
          </div>
        </header>

        <div style={styles.layout}>
          <aside style={styles.sidebar}>
            <p style={styles.sidebarTitle}>Navigation</p>
            <a href='/' style={styles.sidebarLinkActive}>Dashboard</a>
            <span style={styles.sidebarLinkMuted}>Study Plans (coming soon)</span>
            <span style={styles.sidebarLinkMuted}>Quizzes (coming soon)</span>
            <span style={styles.sidebarLinkMuted}>Mock Exams (coming soon)</span>
            <span style={styles.sidebarLinkMuted}>Progress (coming soon)</span>
          </aside>

          <section style={styles.content}>
            <h2 style={styles.contentTitle}>Main Page</h2>
            <p style={styles.contentText}>
              Features are being built. Use the sidebar links as placeholders for upcoming sections.
            </p>
            {error ? <p style={styles.error}>{error}</p> : null}
          </section>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100dvh',
    padding: '1.25rem',
    boxSizing: 'border-box',
    background: 'linear-gradient(120deg, #f8fbff 0%, #ebf3ff 48%, #fdf5e8 100%)',
    fontFamily: 'ui-rounded, system-ui, sans-serif',
  },
  shell: {
    width: 'min(100%, 1100px)',
    margin: '0 auto',
    background: '#fff',
    border: '1px solid #d2dfef',
    borderRadius: '16px',
    boxShadow: '0 18px 45px rgba(8, 36, 84, 0.12)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #dbe6f4',
    backgroundColor: '#f6faff',
  },
  title: {
    margin: 0,
    color: '#133869',
    fontSize: '1.6rem',
  },
  subtitle: {
    margin: '0.25rem 0 0',
    color: '#2b466f',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  emailLabel: {
    color: '#0f355f',
    fontWeight: 600,
    backgroundColor: '#e7f0fb',
    border: '1px solid #c8dbf3',
    padding: '0.4rem 0.6rem',
    borderRadius: '999px',
  },
  button: {
    border: '1px solid #9ab4d5',
    borderRadius: '999px',
    background: '#f3f8ff',
    color: '#123e77',
    padding: '0.45rem 0.8rem',
    cursor: 'pointer',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    minHeight: 'calc(100dvh - 190px)',
  },
  sidebar: {
    borderRight: '1px solid #dbe6f4',
    backgroundColor: '#fbfdff',
    padding: '1.1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.55rem',
  },
  sidebarTitle: {
    margin: '0 0 0.35rem',
    fontSize: '0.86rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#5a7190',
  },
  sidebarLinkActive: {
    color: '#0a4a8e',
    textDecoration: 'none',
    backgroundColor: '#e9f2ff',
    border: '1px solid #c8dcf8',
    borderRadius: '8px',
    padding: '0.55rem 0.65rem',
    fontWeight: 700,
  },
  sidebarLinkMuted: {
    color: '#637a97',
    backgroundColor: '#f6f9fd',
    border: '1px dashed #cfdaea',
    borderRadius: '8px',
    padding: '0.55rem 0.65rem',
  },
  content: {
    padding: '1.4rem 1.5rem',
  },
  contentTitle: {
    margin: 0,
    color: '#163c68',
    fontSize: '1.35rem',
  },
  contentText: {
    margin: '0.7rem 0 0',
    color: '#35567d',
    maxWidth: '62ch',
    lineHeight: 1.6,
  },
  error: {
    marginTop: '1rem',
    color: '#b42318',
  },
};
