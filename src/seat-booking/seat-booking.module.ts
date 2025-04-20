import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createPool } from 'mysql2/promise';
import { SeatBookingService } from './seat_booking.service';
import { SeatBookingController } from './seat_booking.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [SeatBookingController],
  providers: [
    SeatBookingService,
  ],
})
export class SeatBookingModule {}
