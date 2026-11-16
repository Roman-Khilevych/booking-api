import {
  IsEmail,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @IsInt() @Min(1) activityId: number;
  @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsISO8601({ strict: true }) date: string;
  @IsString() @IsNotEmpty() @MaxLength(100) customerName: string;
  @IsEmail() customerEmail: string;
  @IsInt() @Min(1) seats: number;
}
