import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../auth/admin.guard';
import { CreateAdminCafeDto } from './dto/create-admin-cafe.dto';
import { AdminCafeService } from './admin-cafe.service';

@UseGuards(AdminGuard)
@Controller('admin/cafes')
export class AdminCafeController {
  constructor(private readonly svc: AdminCafeService) {}

  @Post()
  create(@Body() dto: CreateAdminCafeDto) {
    return this.svc.create(dto);
  }
}