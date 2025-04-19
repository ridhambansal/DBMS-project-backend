import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../auth/admin.guard';
import { CreateAdminFloorDto } from './dto/create-admin-floor.dto';
import { AdminFloorService } from './admin-floor.service';

@UseGuards(AdminGuard)
@Controller('admin/floors')
export class AdminFloorController {
  constructor(private readonly svc: AdminFloorService) {}

  @Post()
  create(@Body() dto: CreateAdminFloorDto) {
    return this.svc.create(dto);
  }
}