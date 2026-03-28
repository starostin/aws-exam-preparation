import { IsString, IsUUID, MaxLength } from 'class-validator';

export class SubmitQuizAttemptDto {
  @IsUUID()
  questionId!: string;

  @IsString()
  @MaxLength(100)
  selectedOptionId!: string;
}
