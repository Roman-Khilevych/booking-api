import { Activity } from '@/activities/entities/activity.entity.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

export enum BookingStatus {
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
}

@Entity()
@Index(['activityId', 'date'])
export class Booking {
  @PrimaryGeneratedColumn() id: number;
  @Column('int') activityId: number;
  @Column({ type: 'date' }) date: string;
  @Column() customerName: string;
  @Column() customerEmail: string;
  @Column('int') seats: number;
  @Column('int') totalPrice: number; // cents, price at booking time
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.Confirmed,
  })
  status: BookingStatus;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;

  @ManyToOne(() => Activity, (activity) => activity.bookings, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'activityId' })
  activity: Relation<Activity>;
}
