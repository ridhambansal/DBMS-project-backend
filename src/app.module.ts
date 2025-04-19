import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CafeteriaBookingModule } from './cafeteria-booking/cafeteria_booking.module';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [DatabaseModule, AuthModule, EventsModule, CafeteriaBookingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
