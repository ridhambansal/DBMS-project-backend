import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class NotificationsService {
  constructor(private databaseService: DatabaseService) {}

  async getUnreadNotifications(userId: number) {
    console.log(`Service: getUnreadNotifications called for userId: ${userId}`);
    if (isNaN(userId) || userId <= 0) {
      throw new BadRequestException('Invalid user ID provided');
    }

    try {
      const result = await this.databaseService.query(
        'CALL GetUnreadNotifications(?)',
        [userId]
      );
      return result[0];
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      throw new BadRequestException(`Failed to get notifications: ${error.message}`);
    }
  }

  async markAsRead(notificationId: number, userId: number) {
    console.log(`Service: markAsRead called for notificationId: ${notificationId}, userId: ${userId}`);
    if (isNaN(notificationId) || notificationId <= 0) {
      throw new BadRequestException('Invalid notification ID provided');
    }
    if (isNaN(userId) || userId <= 0) {
      throw new BadRequestException('Invalid user ID provided');
    }
    try {
      const result = await this.databaseService.query(
        'CALL MarkNotificationAsRead(?, ?)',
        [notificationId, userId]
      );
      return result[0][0]; // The first row of the first result set
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new BadRequestException(`Failed to mark notification as read: ${error.message}`);
    }
  }
}
