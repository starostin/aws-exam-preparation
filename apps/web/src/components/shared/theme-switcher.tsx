'use client';

import { Laptop, MoonStar, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button type='button' variant='outline' size='icon' className='h-9 w-9'>
        <Laptop className='h-4 w-4' />
        <span className='sr-only'>Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      type='button'
      variant='outline'
      size='icon'
      className='h-9 w-9 border-border bg-card/70 hover:bg-muted'
      onClick={() => {
        setTheme(isDark ? 'light' : 'dark');
      }}
    >
      {isDark ? <Sun className='h-4 w-4' /> : <MoonStar className='h-4 w-4' />}
      <span className='sr-only'>Switch to {isDark ? 'light' : 'dark'} theme</span>
    </Button>
  );
}