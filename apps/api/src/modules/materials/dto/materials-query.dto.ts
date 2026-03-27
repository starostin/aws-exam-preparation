import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const RESOURCE_TYPES = ['docs', 'video', 'course', 'practice_test'] as const;

export class MaterialsQueryDto {
  @IsOptional()
  @IsIn(RESOURCE_TYPES)
  type?: (typeof RESOURCE_TYPES)[number];

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  provider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
