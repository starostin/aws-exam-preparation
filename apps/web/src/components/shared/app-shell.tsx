'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { signOutCurrentUser } from '@/lib/auth/auth-service';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';

interface AppShellProps {
  children: ReactNode;
}

function isAuthPath(pathname: string): boolean {
  return pathname.startsWith('/auth');
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthPath(pathname)) {
      setLoadingUser(false);
      return;
    }

    let isMounted = true;

    async function loadUser(): Promise<void> {
      const { data, error: userError } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (userError) {
        setError(userError.message);
        setLoadingUser(false);
        return;
      }

      setEmail(data.user?.email ?? null);
      setLoadingUser(false);
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, [pathname, supabase]);

  async function handleSignOut(): Promise<void> {
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

  if (isAuthPath(pathname)) {
    return <>{children}</>;
  }

  if (loadingUser) {
    return <main style={styles.page}>Loading...</main>;
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>AWS Exam Preparation</h1>
            <p style={styles.subtitle}>Structured path for SAA-C03 success</p>
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
            <Link href='/' style={pathname === '/' ? styles.sidebarLinkActive : styles.sidebarLink}>
              Dashboard
            </Link>
            <Link
              href='/materials'
              style={pathname.startsWith('/materials') ? styles.sidebarLinkActive : styles.sidebarLink}
            >
              Study Materials
            </Link>
            <span style={styles.sidebarLinkMuted}>Study Plans (coming soon)</span>
            <span style={styles.sidebarLinkMuted}>Quizzes (coming soon)</span>
            <span style={styles.sidebarLinkMuted}>Mock Exams (coming soon)</span>
            <span style={styles.sidebarLinkMuted}>Progress (coming soon)</span>
          </aside>

          <section style={styles.content}>{children}</section>
        </div>

        {error ? <p style={styles.error}>{error}</p> : null}
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
    width: 'min(100%, 1260px)',
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
    fontSize: '1.55rem',
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
    height: 'calc(100dvh - 196px)',
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
  sidebarLink: {
    color: '#21496f',
    textDecoration: 'none',
    border: '1px solid #d4e0ef',
    borderRadius: '8px',
    padding: '0.55rem 0.65rem',
    backgroundColor: '#f7fbff',
    fontWeight: 600,
  },
  sidebarLinkMuted: {
    color: '#637a97',
    backgroundColor: '#f6f9fd',
    border: '1px dashed #cfdaea',
    borderRadius: '8px',
    padding: '0.55rem 0.65rem',
  },
  content: {
    padding: '1.25rem 1.35rem',
    overflow: 'auto',
    minWidth: 0,
    minHeight: 0,
  },
  error: {
    margin: '0.8rem 1.5rem 1rem',
    color: '#b42318',
  },
};
