import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { FlashcardReviewPage } from '@/features/flashcards/FlashcardReviewPage';

export default function FlashcardReviewRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      }
    >
      <FlashcardReviewPage />
    </Suspense>
  );
}
