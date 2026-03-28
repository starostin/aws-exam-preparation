import { ArrayUnique, IsArray, IsDateString, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateStudyPlanDto {
  @IsUUID()
  certificationId!: string;

  @IsDateString()
  targetDate!: string;

  @IsInt()
  @Min(1)
  @Max(8)
  dailyHours!: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  selectedMaterialIds?: string[];
}
