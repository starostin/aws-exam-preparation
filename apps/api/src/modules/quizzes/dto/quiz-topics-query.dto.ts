import { IsOptional, IsUUID } from 'class-validator';

export class QuizTopicsQueryDto {
  @IsOptional()
  @IsUUID()
  certificationId?: string;
}
