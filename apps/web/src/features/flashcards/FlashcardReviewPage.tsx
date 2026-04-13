'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { ChevronLeft, Loader2, RotateCcw, Trophy } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  completeFlashcardSession,
  fetchFlashcardSession,
  fetchFlashcardSessionCards,
  startFlashcardSession,
  submitFlashcardSessionReview,
} from '@/lib/api/flashcards';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type {
  CompleteFlashcardSessionResponse,
  FlashcardSessionCardItem,
  FlashcardSessionProgressResponse,
} from '@aws-exam-prep/types';

const CONFIDENCE_LABELS: Record<number, string> = {
  1: 'Again',
  2: 'Hard',
  3: 'Okay',
  4: 'Good',
  5: 'Easy',
};

const CONFIDENCE_DESCRIPTIONS: Record<number, string> = {
  1: 'Review again tomorrow',
  2: 'Review in 2 days',
  3: 'Review in 4 days',
  4: 'Review in 7 days',
  5: 'Review in 14 days',
};

export function FlashcardReviewPage() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const querySessionId = searchParams.get('sessionId') ?? undefined;
  const topicId = searchParams.get('topicId') ?? undefined;
  const dueOnly = searchParams.get('dueOnly') === 'true';

  const [sessionId, setSessionId] = useState<string | null>(querySessionId ?? null);
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<FlashcardSessionProgressResponse | null>(null);
  const [cards, setCards] = useState<FlashcardSessionCardItem[]>([]);
  const [completion, setCompletion] = useState<CompleteFlashcardSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [confidenceSum, setConfidenceSum] = useState(0);

  // Prevent double-submit on rapid clicks
  const submittingRef = useRef(false);

  const currentCard = cards[currentIndex] ?? null;

  async function loadAllSessionCards(accessToken: string, activeSessionId: string): Promise<FlashcardSessionCardItem[]> {
    const pageSize = 500;
    let page = 1;
    let totalCards = 0;
    const allItems: FlashcardSessionCardItem[] = [];

    do {
      const response = await fetchFlashcardSessionCards(accessToken, activeSessionId, page, pageSize);
      totalCards = response.totalCards;
      allItems.push(...response.items);
      page += 1;
    } while (allItems.length < totalCards && totalCards > 0);

    return allItems;
  }

  function findFirstUnreviewedIndex(items: FlashcardSessionCardItem[]): number {
    return items.findIndex((item) => item.reviewedAt == null);
  }

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

        let activeSessionId = sessionId;
        if (!activeSessionId) {
          const startedSession = await startFlashcardSession(accessToken, {
            ...(topicId ? { topicId } : {}),
            filter: dueOnly ? 'due_only' : 'all',
          });
          activeSessionId = startedSession.sessionId;
        }

        if (!activeSessionId) {
          throw new Error('Unable to start or load flashcard session.');
        }

        const sessionProgress = await fetchFlashcardSession(accessToken, activeSessionId);
        const sessionCards = await loadAllSessionCards(accessToken, activeSessionId);

        if (!isMounted) return;

        setSessionId(activeSessionId);
        setToken(accessToken);
        setSession(sessionProgress);
        setCards(sessionCards);

        const reviewed = sessionCards.filter((item) => item.reviewedAt != null);
        const reviewedConfidenceValues = reviewed
          .map((item) => item.confidence ?? 0)
          .filter((value) => value > 0);
        const initialConfidenceSum = reviewedConfidenceValues.reduce<number>((sum, value) => sum + value, 0);

        setReviewedCount(reviewed.length);
        setConfidenceSum(initialConfidenceSum);

        const firstUnreviewedIndex = findFirstUnreviewedIndex(sessionCards);
        setCurrentIndex(firstUnreviewedIndex >= 0 ? firstUnreviewedIndex : 0);
        setIsFlipped(false);

        if (sessionProgress.status === 'completed') {
          const completed = await completeFlashcardSession(accessToken, activeSessionId);
          if (!isMounted) return;
          setCompletion(completed);
          setSessionDone(true);
          return;
        }

        if (sessionProgress.reviewedCards >= sessionProgress.totalCards && sessionProgress.totalCards > 0) {
          const completed = await completeFlashcardSession(accessToken, activeSessionId);
          if (!isMounted) return;
          setCompletion(completed);
          setSessionDone(true);
          return;
        }

        setCompletion(null);
        setSessionDone(false);
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
  }, [dueOnly, sessionId, supabase, topicId]);

  async function handleRate(confidence: number): Promise<void> {
    if (!currentCard || !token || !sessionId || submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      await submitFlashcardSessionReview(token, sessionId, {
        flashcardId: currentCard.card.id,
        confidence: confidence as 1 | 2 | 3 | 4 | 5,
      });

      const nowIso = new Date().toISOString();
      setCards((previous) => previous.map((item) => (
        item.sessionCardId === currentCard.sessionCardId
          ? {
              ...item,
              confidence: confidence as 1 | 2 | 3 | 4 | 5,
              reviewedAt: nowIso,
            }
          : item
      )));

      setSession((previous) => previous ? {
        ...previous,
        reviewedCards: Math.min(previous.totalCards, previous.reviewedCards + 1),
      } : previous);

      setReviewedCount((c) => c + 1);
      setConfidenceSum((s) => s + confidence);

      const nextUnreviewedIndex = cards.findIndex((item, idx) => idx > currentIndex && item.reviewedAt == null);
      if (nextUnreviewedIndex >= 0) {
        setCurrentIndex(nextUnreviewedIndex);
        setIsFlipped(false);
      } else {
        setIsCompleting(true);
        const completed = await completeFlashcardSession(token, sessionId);
        setCompletion(completed);
        setSessionDone(true);
        setIsFlipped(false);
      }
    } catch {
      setError('Failed to save your rating. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsCompleting(false);
      submittingRef.current = false;
    }
  }

  const backHref: Route = '/flashcards';

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading cards...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" asChild>
          <Link href={backHref}>Back to Flashcards</Link>
        </Button>
      </div>
    );
  }

  if (sessionDone && completion) {
    const avgConfidence = completion.averageConfidence ?? (reviewedCount > 0 ? confidenceSum / reviewedCount : 0);
    const avgLabel = avgConfidence >= 4.5 ? 'Excellent' : avgConfidence >= 3 ? 'Good' : 'Needs work';

    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center max-w-md mx-auto">
        <Trophy className="h-16 w-16 text-yellow-500" />
        <div>
          <h2 className="text-2xl font-bold">Session Complete!</h2>
          <p className="text-muted-foreground mt-1">You reviewed {completion.reviewedCards} flashcard{completion.reviewedCards !== 1 ? 's' : ''}.</p>
        </div>
        <div className="w-full rounded-lg border p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cards reviewed</span>
            <span className="font-medium">{completion.reviewedCards}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Average confidence</span>
            <span className="font-medium">{avgConfidence.toFixed(1)} / 5 ({avgLabel})</span>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setIsFlipped(false);
              setSessionDone(false);
              setSessionId(null);
              setSession(null);
              setCompletion(null);
            }}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Review Again
          </Button>
          <Button asChild>
            <Link href={backHref}>Back to Flashcards</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!currentCard || !session) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="gap-1 -ml-2">
          <Link href={backHref}>
            <ChevronLeft className="h-4 w-4" />
            Flashcards
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground ml-auto">
          {session.reviewedCards} reviewed • {currentIndex + 1} / {cards.length}
        </span>
      </div>

      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {currentCard.card.topicTitle}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${session.totalCards > 0 ? (session.reviewedCards / session.totalCards) * 100 : 0}%` }}
        />
      </div>

      {/* Card with flip */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: '1200px', minHeight: '260px' }}
        onClick={() => {
          if (!isFlipped) setIsFlipped(true);
        }}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Card back — showing answer' : 'Card front — click to reveal answer'}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isFlipped) setIsFlipped(true);
        }}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '260px',
          }}
        >
          {/* Front */}
          <Card
            className="absolute inset-0"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[260px] p-8 text-center gap-4">
              <p className="text-lg font-medium leading-relaxed">{currentCard.card.front}</p>
              {!isFlipped && (
                <p className="text-xs text-muted-foreground mt-4">Click to reveal answer</p>
              )}
            </CardContent>
          </Card>

          {/* Back */}
          <Card
            className="absolute inset-0 bg-muted/30"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <CardContent className="flex flex-col items-start justify-center h-full min-h-[260px] p-8">
              <p className="text-sm leading-relaxed whitespace-pre-line">{currentCard.card.back}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rating buttons — shown only after flip */}
      {isFlipped && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">How well did you know this?</p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                disabled={isSubmitting || isCompleting}
                onClick={() => { void handleRate(level); }}
                title={CONFIDENCE_DESCRIPTIONS[level]}
                className={[
                  'flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs font-medium transition-colors',
                  'hover:bg-primary hover:text-primary-foreground hover:border-primary',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                ].join(' ')}
              >
                <span className="text-lg font-bold">{level}</span>
                <span>{CONFIDENCE_LABELS[level]}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {CONFIDENCE_DESCRIPTIONS[1]} · · · {CONFIDENCE_DESCRIPTIONS[5]}
          </p>
        </div>
      )}
    </div>
  );
}
