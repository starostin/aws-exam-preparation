import { IsString, IsUUID, MaxLength } from 'class-validator';

export class SubmitQuizAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsString()
  @MaxLength(100)
  selectedOptionId!: string;
}