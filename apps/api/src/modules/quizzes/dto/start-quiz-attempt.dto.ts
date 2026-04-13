import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

const QUIZ_MODES = ['topic', 'mixed'] as const;
const QUESTION_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const QUESTION_SELECTIONS = ['all', 'unanswered'] as const;

export class StartQuizAttemptDto {
  @IsOptional()
  @IsIn(QUIZ_MODES)
  mode?: (typeof QUIZ_MODES)[number];

  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @IsUUID()
  certificationId?: string;

  @IsOptional()
  @IsIn(QUESTION_DIFFICULTIES)
  difficulty?: (typeof QUESTION_DIFFICULTIES)[number];

  @IsOptional()
  @IsIn(QUESTION_SELECTIONS)
  selection?: (typeof QUESTION_SELECTIONS)[number];

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}