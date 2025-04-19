import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { MeetingRoomsService } from './meeting-rooms.service';

@Controller('meeting-rooms')
export class MeetingRoomsController {
  constructor(private readonly meetingRoomsService: MeetingRoomsService) {}

  @Get()
  async findAll() {
    console.log('Controller: findAll called');
    return this.meetingRoomsService.findAll();
  }
  @Get('bookings')
  async getBookings(@Query('userId') userId: string, @Query('date') date: string) {
    console.log(`Controller: getBookings called with userId: ${userId}, date: ${date}`);
    return this.meetingRoomsService.getBookings(userId ? +userId : null, date);
  }

  @Post('book')
  async bookRoom(@Body() bookingData: any) {
    console.log('Controller: bookRoom called with data:', bookingData);
    return this.meetingRoomsService.bookRoom(bookingData);
  }

  @Delete('bookings/:id')
  async cancelBooking(@Param('id') id: string) {
    console.log(`Controller: cancelBooking called with id: ${id}`);
    return this.meetingRoomsService.cancelBooking(+id);
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(`Controller: findOne called with id: ${id}`);
    return this.meetingRoomsService.findOne(+id);
  }
}