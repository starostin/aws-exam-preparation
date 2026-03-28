import { IsIn } from 'class-validator';

const ALLOWED_STATUSES = ['pending', 'in_progress', 'completed'] as const;

export class UpdateTaskStatusDto {
  @IsIn(ALLOWED_STATUSES)
  status!: (typeof ALLOWED_STATUSES)[number];
}
