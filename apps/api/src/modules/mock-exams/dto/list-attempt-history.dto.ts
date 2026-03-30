import { IsOptional, IsUUID } from 'class-validator';

export class ListAttemptHistoryDto {
  @IsOptional()
  @IsUUID()
  certificationId?: string;
}
