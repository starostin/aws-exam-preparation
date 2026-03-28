import type { Metadata } from "next";
import { Space_Grotesk } from 'next/font/google';
import { AppShell } from '@/components/shared/app-shell';
import { ThemeProvider } from '@/components/shared/theme-provider';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: "AWS Exam Preparation",
  description: "Prepare for your AWS certification exams with daily study plans, quizzes, and mock exams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} min-h-screen font-[var(--font-space-grotesk)]`}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
