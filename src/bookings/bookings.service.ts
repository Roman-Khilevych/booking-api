import { Activity } from '@/activities/entities/activity.entity.js';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { Booking, BookingStatus } from './entities/booking.entity.js';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly repo: Repository<Booking>,
    private readonly dataSource: DataSource,
  ) {}

  findAll() {
    return this.repo.find({
      relations: { activity: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const booking = await this.repo.findOne({
      where: { id },
      relations: { activity: true },
    });

    if (!booking) throw new NotFoundException(`Booking ${id} not found`);

    return booking;
  }

  create(createBookingDto: CreateBookingDto) {
    const today = new Date().toISOString().slice(0, 10);
    if (createBookingDto.date < today)
      throw new BadRequestException('Date is in the past');

    return this.dataSource.transaction(async (manager) => {
      // 1. Lock the activity row: concurrent bookings for it wait here until we commit
      const activity = await manager.findOne(Activity, {
        where: { id: createBookingDto.activityId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!activity)
        throw new NotFoundException(
          `Activity ${createBookingDto.activityId} not found`,
        );

      // 2. Seats already taken on that date (cancelled bookings don't count)
      const booked =
        (await manager.sum(Booking, 'seats', {
          activityId: createBookingDto.activityId,
          date: createBookingDto.date,
          status: BookingStatus.Confirmed,
        })) ?? 0;

      const free = activity.capacity - booked;
      if (createBookingDto.seats > free)
        throw new ConflictException(
          `Only ${free} seats left on ${createBookingDto.date}`,
        );

      // 3. Save with server-calculated price
      return manager.save(
        manager.create(Booking, {
          activityId: createBookingDto.activityId,
          date: createBookingDto.date,
          customerName: createBookingDto.customerName,
          customerEmail: createBookingDto.customerEmail,
          seats: createBookingDto.seats,
          totalPrice: activity.price * createBookingDto.seats,
        }),
      );
    });
  }

  async update(id: number, updateBookingDto: UpdateBookingDto) {
    const booking = await this.findOne(id);
    this.repo.merge(booking, updateBookingDto);

    return this.repo.save(booking);
  }

  async cancel(id: number) {
    const booking = await this.findOne(id);
    if (booking.status === BookingStatus.Cancelled) {
      throw new ConflictException(`Booking ${id} is already cancelled`);
    }

    booking.status = BookingStatus.Cancelled;

    return this.repo.save(booking);
  }
}
