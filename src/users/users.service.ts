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
}