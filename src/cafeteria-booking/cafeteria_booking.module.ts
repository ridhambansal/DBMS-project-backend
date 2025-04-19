import { Module, forwardRef } from '@nestjs/common';
import { CafeteriaBookingService } from './cafeteria_booking.service';
import { CafeteriaBookingController } from './cafeteria_booking.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule
  ],
  controllers: [CafeteriaBookingController],
  providers: [CafeteriaBookingService],
  exports: [CafeteriaBookingService],
})
export class CafeteriaBookingModule {}
