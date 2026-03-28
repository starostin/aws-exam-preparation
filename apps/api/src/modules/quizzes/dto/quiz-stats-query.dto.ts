import { IsOptional, IsUUID } from 'class-validator';

export class QuizStatsQueryDto {
  @IsOptional()
  @IsUUID()
  topicId?: string;
}
