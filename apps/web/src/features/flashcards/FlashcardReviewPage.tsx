'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { ChevronLeft, Loader2, RotateCcw, Trophy } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchDueFlashcards, fetchFlashcards, submitFlashcardReview } from '@/lib/api/flashcards';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { FlashcardWithReview } from '@aws-exam-prep/types';

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

  const topicId = searchParams.get('topicId') ?? undefined;
  const dueOnly = searchParams.get('dueOnly') === 'true';

  const [token, setToken] = useState<string | null>(null);
  const [cards, setCards] = useState<FlashcardWithReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [confidenceSum, setConfidenceSum] = useState(0);

  // Prevent double-submit on rapid clicks
  const submittingRef = useRef(false);

  const currentCard = cards[currentIndex] ?? null;

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

        const cardData = dueOnly
          ? await fetchDueFlashcards(accessToken, topicId)
          : await fetchFlashcards(accessToken, topicId ? { topicId } : {});

        if (!isMounted) return;

        if (cardData.length === 0) {
          setError(
            dueOnly
              ? 'No cards are due for review right now. Come back later or review all cards.'
              : 'No flashcards found for this topic.',
          );
          setCards([]);
          setIsLoading(false);
          return;
        }

        setToken(accessToken);
        setCards(cardData);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionDone(false);
        setReviewedCount(0);
        setConfidenceSum(0);
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
  }, [dueOnly, supabase, topicId]);

  async function handleRate(confidence: number): Promise<void> {
    if (!currentCard || !token || submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      await submitFlashcardReview(token, {
        flashcardId: currentCard.id,
        confidence: confidence as 1 | 2 | 3 | 4 | 5,
      });

      const nextIndex = currentIndex + 1;
      setReviewedCount((c) => c + 1);
      setConfidenceSum((s) => s + confidence);

      if (nextIndex >= cards.length) {
        setSessionDone(true);
      } else {
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
      }
    } catch {
      setError('Failed to save your rating. Please try again.');
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  }

  const backHref: Route = topicId
    ? (`/flashcards?topicId=${topicId}` as Route)
    : '/flashcards';

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

  if (sessionDone) {
    const avgConfidence = reviewedCount > 0 ? confidenceSum / reviewedCount : 0;
    const avgLabel = avgConfidence >= 4.5 ? 'Excellent' : avgConfidence >= 3 ? 'Good' : 'Needs work';

    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center max-w-md mx-auto">
        <Trophy className="h-16 w-16 text-yellow-500" />
        <div>
          <h2 className="text-2xl font-bold">Session Complete!</h2>
          <p className="text-muted-foreground mt-1">You reviewed {reviewedCount} flashcard{reviewedCount !== 1 ? 's' : ''}.</p>
        </div>
        <div className="w-full rounded-lg border p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cards reviewed</span>
            <span className="font-medium">{reviewedCount}</span>
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
              setReviewedCount(0);
              setConfidenceSum(0);
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

  if (!currentCard) return null;

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
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {currentCard.topicTitle}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
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
              <p className="text-lg font-medium leading-relaxed">{currentCard.front}</p>
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
              <p className="text-sm leading-relaxed whitespace-pre-line">{currentCard.back}</p>
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
                disabled={isSubmitting}
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
