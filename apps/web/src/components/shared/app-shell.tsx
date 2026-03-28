'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { BookOpen, CalendarClock, ClipboardList, HelpCircle, LayoutDashboard, LogOut, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { signOutCurrentUser } from '@/lib/auth/auth-service';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { ThemeSwitcher } from './theme-switcher';

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
    return (
      <main className='grid min-h-screen place-items-center bg-background text-muted-foreground'>
        Loading your dashboard...
      </main>
    );
  }

  const navItems: Array<{ href: '/' | '/study-plans' | '/materials' | '/quizzes'; label: string; icon: LucideIcon }> = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/study-plans', label: 'Study Plans', icon: ClipboardList },
    { href: '/materials', label: 'Study Materials', icon: BookOpen },
    { href: '/quizzes', label: 'Quizzes', icon: HelpCircle },
  ];

  return (
    <main className='relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-6'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(6,182,212,0.12),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.14),transparent_35%)] dark:bg-[radial-gradient(circle_at_15%_15%,rgba(19,164,181,0.16),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(24,64,160,0.2),transparent_35%)]' />

      <div className='relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1600px] overflow-hidden rounded-3xl border border-border/70 bg-card/75 backdrop-blur-sm animate-rise-in'>
        <aside className='hidden w-72 flex-col border-r border-border/70 bg-card/90 p-5 lg:flex'>
          <div className='mb-10'>
            <p className='text-xs uppercase tracking-[0.2em] text-cyan-300/80'>AWS Focus Mode</p>
            <h1 className='mt-2 text-2xl font-semibold text-foreground'>Exam Preparation</h1>
            <p className='mt-2 text-sm text-muted-foreground'>Structure your learning sprint with a calm and consistent rhythm.</p>
          </div>

          <nav className='space-y-2'>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200'
                      : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className='h-4 w-4' />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className='mt-4 space-y-2 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground'>
              <p className='font-medium text-foreground'>Coming Next</p>
              <p>Mock Exams</p>
              <p>Progress</p>
            </div>
          </nav>

          <div className='mt-auto rounded-xl border border-border bg-background/60 p-4'>
            <p className='text-xs uppercase tracking-widest text-muted-foreground'>Signed in as</p>
            <p className='mt-1 truncate text-sm text-foreground'>{email ?? 'No user email found'}</p>
          </div>
        </aside>

        <div className='flex min-w-0 flex-1 flex-col'>
          <header className='border-b border-border/70 bg-card/70 px-4 py-4 sm:px-6'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <Badge className='border-cyan-400/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200'>
                  <Sparkles className='mr-1 h-3.5 w-3.5' />
                  Focus Session
                </Badge>
                <Badge variant='secondary'>
                  <CalendarClock className='mr-1 h-3.5 w-3.5' />
                  Daily plan
                </Badge>
              </div>

              <div className='flex items-center gap-2'>
                <ThemeSwitcher />
                <span className='hidden max-w-52 truncate text-sm text-muted-foreground sm:inline'>{email ?? 'No user email found'}</span>
                <Button
                  type='button'
                  variant='outline'
                  className='border-border bg-background/70 text-foreground hover:bg-muted'
                  onClick={() => {
                    void handleSignOut();
                  }}
                >
                  <LogOut className='h-4 w-4' />
                  Sign out
                </Button>
              </div>
            </div>

            <nav className='mt-4 flex gap-2 lg:hidden'>
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium',
                      isActive ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-200' : 'text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <section className='flex-1 overflow-auto px-4 py-5 sm:px-6'>{children}</section>

          {error ? <p className='border-t border-border/70 px-6 py-3 text-sm text-destructive'>{error}</p> : null}
          </div>
      </div>
    </main>
  );
}
