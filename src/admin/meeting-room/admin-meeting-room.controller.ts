import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../auth/admin.guard';
import { CreateAdminMeetingRoomDto } from './dto/create-admin-meeting-room.dto';
import { AdminMeetingRoomService } from './admin-meeting-room.service';

@UseGuards(AdminGuard)
@Controller('admin/meeting-rooms')
export class AdminMeetingRoomController {
  constructor(private readonly svc: AdminMeetingRoomService) {}

  @Post()
  create(@Body() dto: CreateAdminMeetingRoomDto) {
    return this.svc.create(dto);
  }
}