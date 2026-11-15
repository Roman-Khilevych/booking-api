import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ActivityType } from '../entities/activity.entity.js';

export class CreateActivityDto {
  @IsString() @IsNotEmpty() @MaxLength(255) title: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(ActivityType) type: ActivityType;
  @IsInt() @Min(0) price: number;
  @IsInt() @Min(1) capacity: number;
}
