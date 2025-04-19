import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CafeteriaBookingModule } from './cafeteria-booking/cafeteria_booking.module';
import { DatabaseModule } from './database/database.module';
import { MeetingRoomsModule } from './meeting-rooms/meeting-rooms.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { SeatBookingModule } from './seat-booking/seat-booking.module';
import { FloorModule } from './floor/floor.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    MeetingRoomsModule,
    UsersModule,
    EventsModule,
    CafeteriaBookingModule,
    SeatBookingModule,
    FloorModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
