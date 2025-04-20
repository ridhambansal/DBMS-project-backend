import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  @Get()
  async getUnreadNotifications(@Query('userId') userId: string) {
    console.log(`Controller: getUnreadNotifications called for userId: ${userId}`);
    return this.notificationsService.getUnreadNotifications(+userId);
  }

  @Post(':notificationId/read')
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @Query('userId') userId: string,
  ) {
    console.log(`Controller: markAsRead called for notificationId: ${notificationId}, userId: ${userId}`);
    return this.notificationsService.markAsRead(+notificationId, +userId);
  }
}
