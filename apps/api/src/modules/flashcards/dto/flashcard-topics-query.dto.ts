import { IsOptional, IsUUID } from 'class-validator';

export class FlashcardTopicsQueryDto {
  @IsOptional()
  @IsUUID()
  certificationId?: string;
}
