import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class SubmitReviewDto {
  @IsUUID()
  flashcardId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  confidence!: number;
}
