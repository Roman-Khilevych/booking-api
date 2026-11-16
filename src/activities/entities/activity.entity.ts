import { Booking } from '@/bookings/entities/booking.entity.js';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

export enum ActivityType {
  Yacht = 'yacht',
  Diving = 'diving',
  Tour = 'tour',
}

@Entity()
export class Activity {
  @PrimaryGeneratedColumn() id: number;
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ type: 'enum', enum: ActivityType }) type: ActivityType;
  @Column('int') price: number; // price in cents
  @Column('int') capacity: number;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.activity)
  bookings: Relation<Booking[]>;
}
