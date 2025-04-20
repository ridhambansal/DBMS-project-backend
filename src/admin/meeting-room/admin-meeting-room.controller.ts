import { Controller, Post, Body, UseGuards, Param, Get, Put } from '@nestjs/common';
import { AdminGuard } from '../../auth/admin.guard';
import { CreateAdminMeetingRoomDto } from './dto/create-admin-meeting-room.dto';
import { AdminMeetingRoomService } from './admin-meeting-room.service';
import { UpdateAdminMeetingRoomDto } from './dto/update-admin-meeting-room.dto';

@UseGuards(AdminGuard)
@Controller('admin/meeting-rooms')
export class AdminMeetingRoomController {
  constructor(private readonly svc: AdminMeetingRoomService) {}

  @Post()
  create(@Body() dto: CreateAdminMeetingRoomDto) {
    return this.svc.create(dto);
  }


  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminMeetingRoomDto,
  ) {
    return this.svc.update(+id, dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }
}