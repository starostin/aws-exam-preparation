import { IsDateString } from 'class-validator';

export class RescheduleTaskDto {
  @IsDateString()
  targetDate!: string;
}
