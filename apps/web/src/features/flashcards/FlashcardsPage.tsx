'use client';

import type { Route } from 'next';
import { BookOpen, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFlashcardTopics } from '@/lib/api/flashcards';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { FlashcardTopicSummary } from '@aws-exam-prep/types';

function buildReviewHref(topicId: string, dueOnly: boolean): string {
  const params = new URLSearchParams({ topicId });
  if (dueOnly) params.set('dueOnly', 'true');
  return `/flashcards/review?${params.toString()}`;
}

export function FlashcardsPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [topics, setTopics] = useState<FlashcardTopicSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const topicsData = await fetchFlashcardTopics(accessToken);
        if (!isMounted) return;
        setTopics(topicsData);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load flashcards.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void init();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading flashcards...
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  const totalCards = topics.reduce((sum, t) => sum + t.cardCount, 0);
  const totalDue = topics.reduce((sum, t) => sum + t.dueCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Flashcards</h1>
        <p className="text-muted-foreground mt-1">
          {totalCards} cards across {topics.length} topics
          {totalDue > 0 && (
            <span className="ml-2 text-amber-600 font-medium">· {totalDue} due for review</span>
          )}
        </p>
      </div>

      {totalDue > 0 && (
        <Button
          onClick={() => {
            router.push('/flashcards/review?dueOnly=true' as Route);
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Review All Due Cards ({totalDue})
        </Button>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Card key={topic.topicId} className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base leading-snug">{topic.topicTitle}</CardTitle>
              <CardDescription className="text-xs">{topic.domainName}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0 flex-1 justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{topic.cardCount} cards</Badge>
                {topic.dueCount > 0 && (
                  <Badge variant="outline" className="border-amber-500 text-amber-600">
                    {topic.dueCount} due
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {topic.dueCount > 0 && (
                  <Button
                    size="sm"
                    onClick={() => {
                      router.push(buildReviewHref(topic.topicId, true) as Route);
                    }}
                    className="w-full gap-2"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Review Due ({topic.dueCount})
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={topic.dueCount > 0 ? 'outline' : 'default'}
                  onClick={() => {
                    router.push(buildReviewHref(topic.topicId, false) as Route);
                  }}
                  className="w-full gap-2"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Review All
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {topics.length === 0 && (
        <p className="text-sm text-muted-foreground">No flashcard topics available yet.</p>
      )}
    </div>
  );
}
