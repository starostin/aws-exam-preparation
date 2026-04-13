import { IsOptional, IsUUID } from 'class-validator';

export class ListQuizAttemptHistoryDto {
  @IsOptional()
  @IsUUID()
  certificationId?: string;
}