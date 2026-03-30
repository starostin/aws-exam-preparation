import { IsOptional, IsUUID } from 'class-validator';

export class ListMockExamsDto {
  @IsOptional()
  @IsUUID()
  certificationId?: string;
}
