import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createPool } from 'mysql2/promise';
import { SeatBookingService } from './seat_booking.service';
import { SeatBookingController } from './seat_booking.controller';

@Module({
  imports: [ConfigModule],
  controllers: [SeatBookingController],
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: async (config: ConfigService) =>
        createPool({
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 3306),
          user: config.get<string>('DB_USER', 'root'),
          password: config.get<string>('DB_PASS', 'Utkarsh321'),
          database: config.get<string>('DB_NAME', 'office_management'),
          connectionLimit: 10,
        }),
      inject: [ConfigService],
    },
    SeatBookingService,
  ],
})
export class SeatBookingModule {}
