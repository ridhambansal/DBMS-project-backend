import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../../auth/auth.module';
import { AdminMeetingRoomService } from './admin-meeting-room.service';
import { AdminMeetingRoomController } from './admin-meeting-room.controller';
import { UsersModule } from 'src/users/users.module';
import { AdminGuard } from 'src/auth/admin.guard';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule    ],
  providers: [AdminMeetingRoomService, AdminGuard],
  controllers: [AdminMeetingRoomController],
})
export class AdminMeetingRoomModule {}