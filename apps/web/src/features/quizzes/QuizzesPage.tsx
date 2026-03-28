'use client';

import type { Route } from 'next';
import { HelpCircle, Loader2, Play } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  fetchQuizTopics,
} from '@/lib/api/quizzes';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { buildQuizSessionHref, DIFFICULTY_OPTIONS, LIMIT_OPTIONS, parseQuizSetupState } from './quiz-session';
import type {
  QuestionDifficulty,
  QuizMode,
  QuizTopicSummary,
} from '@aws-exam-prep/types';

export function QuizzesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const setupState = parseQuizSetupState(searchParams);

  const [topics, setTopics] = useState<QuizTopicSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<QuizMode>(setupState.mode);
  const [topicId, setTopicId] = useState<string>(setupState.topicId);
  const [difficulty, setDifficulty] = useState<'all' | QuestionDifficulty>(setupState.difficulty);
  const [questionLimit, setQuestionLimit] = useState<number>(setupState.questionLimit);

  useEffect(() => {
    let isMounted = true;

    async function init(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error(sessionError.message);

        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error('Not authenticated. Please sign in.');

        const topicsData = await fetchQuizTopics(accessToken);

        if (!isMounted) return;

        setTopics(topicsData);

        setMode(setupState.mode);
        setDifficulty(setupState.difficulty);
        setQuestionLimit(setupState.questionLimit);
        if (setupState.mode === 'topic' && topicsData.some((topic) => topic.topicId === setupState.topicId)) {
          setTopicId(setupState.topicId);
        } else {
          setTopicId('none');
        }
      } catch (initError) {
        if (!isMounted) return;
        setError(initError instanceof Error ? initError.message : 'Failed to load quizzes.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void init();
    return () => {
      isMounted = false;
    };
  }, [setupState.difficulty, setupState.mode, setupState.questionLimit, setupState.topicId, supabase]);

  function handleStartQuiz(): void {
    if (mode === 'topic' && topicId === 'none') {
      setError('Please select a topic before starting a topic quiz.');
      return;
    }

    setIsStartingQuiz(true);
    setError(null);

    const sessionHref = buildQuizSessionHref({
      mode,
      topicId,
      difficulty,
      questionLimit,
    }) as Route;

    router.push(sessionHref);
  }

  if (isLoading) {
    return <p className='text-sm text-muted-foreground'>Loading quizzes...</p>;
  }

  if (error && topics.length === 0) {
    return <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>{error}</p>;
  }

  return (
    <div className='flex flex-col gap-6 pb-8 animate-rise-in'>
      <div className='space-y-2'>
        <Badge className='bg-violet-500/15 text-violet-700 dark:text-violet-300'>
          <HelpCircle className='mr-1 h-3.5 w-3.5' />
          Practice Quizzes
        </Badge>
        <h2 className='text-3xl font-semibold text-foreground'>Sharpen Your AWS Decision Skills</h2>
        <p className='text-sm text-muted-foreground'>
          Practice by topic or run mixed drills, get immediate feedback, and track your quiz accuracy over time.
        </p>
      </div>

      <Card className='border-border/70 bg-card/70'>
        <CardHeader>
          <CardTitle>Quiz Setup</CardTitle>
          <CardDescription>Choose mode, filters, and question count before starting.</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Mode</p>
            <Select value={mode} onValueChange={(value) => setMode(value as QuizMode)}>
              <SelectTrigger className='bg-background/70 text-foreground'>
                <SelectValue placeholder='Choose mode' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='topic'>Topic Quiz</SelectItem>
                <SelectItem value='mixed'>Mixed Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Topic</p>
            <Select value={topicId} onValueChange={setTopicId} disabled={mode === 'mixed'}>
              <SelectTrigger className='bg-background/70 text-foreground'>
                <SelectValue placeholder='Select topic' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>Select topic</SelectItem>
                {topics.map((topic) => (
                  <SelectItem key={topic.topicId} value={topic.topicId}>
                    {topic.topicTitle} ({topic.questionCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Difficulty</p>
            <Select value={difficulty} onValueChange={(value) => setDifficulty(value as 'all' | QuestionDifficulty)}>
              <SelectTrigger className='bg-background/70 text-foreground'>
                <SelectValue placeholder='All difficulties' />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Questions</p>
            <Select value={String(questionLimit)} onValueChange={(value) => setQuestionLimit(Number(value))}>
              <SelectTrigger className='bg-background/70 text-foreground'>
                <SelectValue placeholder='10' />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value} questions
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='md:col-span-2 xl:col-span-4 flex justify-end'>
            <Button
              type='button'
              className='bg-violet-500 text-white hover:bg-violet-400'
              onClick={handleStartQuiz}
              disabled={isStartingQuiz || (mode === 'topic' && topicId === 'none')}
            >
              {isStartingQuiz ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Play className='mr-2 h-4 w-4' />}
              Start Quiz
            </Button>
            {error ? <p className='mt-2 text-sm text-destructive'>{error}</p> : null}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
