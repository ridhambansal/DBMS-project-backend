import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
  } from '@nestjs/common';
  import { SeatBookingService } from './seat_booking.service';
  import { CreateSeatBookingDto } from './dto/create-seat_booking.dto';
  import { UpdateSeatBookingDto } from './dto/update-seat_booking.dto';
  
  @Controller('seat-bookings')
  export class SeatBookingController {
    constructor(private readonly svc: SeatBookingService) {}
  
    @Post()
    create(@Body() dto: CreateSeatBookingDto) {
      return this.svc.create(dto);
    }
  
    @Get()
    findAll() {
      return this.svc.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.svc.findOne(+id);
    }
  
    @Patch(':id')
    update(
      @Param('id') id: string,
      @Body() dto: UpdateSeatBookingDto,
    ) {
      return this.svc.update(+id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.svc.remove(+id);
    }

    @Get('user/:userId')
  async getByUser(
    @Param('userId', ParseIntPipe) userId: number
  ) {
    return this.svc.findAllByUser(userId);
  }
  }
  