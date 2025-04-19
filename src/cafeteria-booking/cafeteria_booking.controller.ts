// src/cafeteria-booking/cafeteria_booking.controller.ts

import {
    Controller,
    Post,
    Delete,
    Body,
    Param,
    Patch,
  } from '@nestjs/common';
  import { CafeteriaBookingService } from './cafeteria_booking.service';
  import { CreateCafeteriaBookingDto } from './dto/create-cafeteria_booking.dto';
  import { CancelBookingDto } from './dto/cancel-booking.dto';
  import { CheckCafeAvailabilityDto } from './dto/check-availability.dto';
import { UpdateCafeteriaBookingDto } from './dto/update-cafeteria_booking.dto';
  
  @Controller('cafeteria-booking')
  export class CafeteriaBookingController {
    constructor(private readonly svc: CafeteriaBookingService) {}
  
    @Post()
    async create(@Body() dto: CreateCafeteriaBookingDto) {
      // Pass the entire DTO, including dto.user_id
      return this.svc.bookCafe(dto.user_id, dto);
    }
  
    @Post('availability')
    async checkAvailability(@Body() dto: CheckCafeAvailabilityDto) {
      return this.svc.isAvailable(dto);
    }
  
    @Delete(':id')
    async cancel(
      @Param('id') id: string,
      @Body() dto: CancelBookingDto,
    ) {
      return this.svc.cancelBooking(+id, dto.user_id);
    }

    @Patch(':id')
    update(
      @Param('id') bookingId: string,
      @Body() dto: UpdateCafeteriaBookingDto,
    ) {
      return this.svc.updateBooking(+bookingId, dto);
    }
  }
  