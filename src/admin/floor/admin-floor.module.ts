import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { AdminFloorService } from './admin-floor.service';
import { AdminFloorController } from './admin-floor.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule],
  providers: [AdminFloorService],
  controllers: [AdminFloorController],
})
export class AdminFloorModule {}