import { Controller, Post, Body, UseGuards, Get, Put, Param } from '@nestjs/common';
import { AdminGuard } from '../../auth/admin.guard';
import { CreateAdminCafeDto } from './dto/create-admin-cafe.dto';
import { AdminCafeService } from './admin-cafe.service';
import { UpdateAdminCafeDto } from './dto/update-admin-cafe.dto';

@UseGuards(AdminGuard)
@Controller('admin/cafes')
export class AdminCafeController {
  constructor(private readonly svc: AdminCafeService) {}

  @Post()
  create(@Body() dto: CreateAdminCafeDto) {
    return this.svc.create(dto);
  }

  @Put(':name')
  update(
    @Param('name') name: string,
    @Body() dto: UpdateAdminCafeDto,
  ) {
    return this.svc.update(name, dto);
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }
}