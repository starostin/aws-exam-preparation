import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

const SESSION_FILTERS = ['all', 'due_only'] as const;

export class StartFlashcardSessionDto {
  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @IsUUID()
  certificationId?: string;

  @IsOptional()
  @IsIn(SESSION_FILTERS)
  filter?: (typeof SESSION_FILTERS)[number];

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}
