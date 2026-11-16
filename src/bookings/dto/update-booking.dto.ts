import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto.js';

export class UpdateBookingDto extends PartialType(
  PickType(CreateBookingDto, ['customerName', 'customerEmail'] as const),
) {}
