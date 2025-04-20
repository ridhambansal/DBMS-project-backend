import { Controller, Post, Body, UseGuards, Param, Put } from '@nestjs/common';
import { AdminGuard } from '../../auth/admin.guard';
import { CreateAdminFloorDto } from './dto/create-admin-floor.dto';
import { AdminFloorService } from './admin-floor.service';
import { UpdateAdminFloorDto } from './dto/update-admin-floor.dto';

@UseGuards(AdminGuard)
@Controller('admin/floors')
export class AdminFloorController {
  constructor(private readonly svc: AdminFloorService) {}

  @Post()
  create(@Body() dto: CreateAdminFloorDto) {
    return this.svc.create(dto);
  }


  @Put(':floor_number')
  update(
    @Param('floor_number') floorNumber: string,
    @Body() dto: UpdateAdminFloorDto,
  ) {
    return this.svc.update(+floorNumber, dto);
  }
}