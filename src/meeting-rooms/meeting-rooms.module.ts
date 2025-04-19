import { Module } from '@nestjs/common';
import { MeetingRoomsController } from './meeting-rooms.controller';
import { MeetingRoomsService } from './meeting-rooms.service';

@Module({
  controllers: [MeetingRoomsController],
  providers: [MeetingRoomsService],
})
export class MeetingRoomsModule {}
