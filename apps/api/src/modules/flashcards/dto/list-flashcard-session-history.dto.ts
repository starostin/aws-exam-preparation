import { IsOptional, IsUUID } from 'class-validator';

export class ListFlashcardSessionHistoryDto {
  @IsOptional()
  @IsUUID()
  certificationId?: string;
}
