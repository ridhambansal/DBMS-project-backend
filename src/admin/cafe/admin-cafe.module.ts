import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { AdminCafeService } from './admin-cafe.service';
import { AdminCafeController } from './admin-cafe.controller';
import { UsersModule } from 'src/users/users.module';
import { AdminGuard } from 'src/auth/admin.guard';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [AdminCafeService, AdminGuard],
  controllers: [AdminCafeController],
})
export class AdminCafeModule {}