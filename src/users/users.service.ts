import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    return this.databaseService.query(`
      SELECT user_id, first_name, last_name, email_id, company
      FROM User
      ORDER BY first_name, last_name
    `);
  }

  async findOne(id: number): Promise<any> {
    const rows = await this.databaseService.query(
      'SELECT user_id, first_name, last_name, email_id, company, access_level_id \
       FROM `User` \
       WHERE user_id = ?',
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  }
}