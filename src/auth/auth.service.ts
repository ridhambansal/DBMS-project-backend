import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private databaseService: DatabaseService) {}

  async register(userData: any): Promise<any> {
    const {
      first_name,
      last_name,
      email_id,
      password,
      company,
      access_level_id,
    } = userData;
    const existingUsers = await this.databaseService.query(
      'SELECT * FROM User WHERE email_id = ?',
      [email_id]
    );

    if (existingUsers.length > 0) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await this.databaseService.query(
      'INSERT INTO User (first_name, last_name, email_id, password, company, access_level_id) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email_id, hashedPassword, company, access_level_id]
    );

    // Get the newly created user
    const newUser = await this.databaseService.query(
      'SELECT user_id, first_name, last_name, email_id, company, access_level_id FROM User WHERE user_id = ?',
      [result.insertId],
    );
    return newUser[0];
  }
  async login(credentials: any): Promise<any> {
    const { email_id, password } = credentials;
    const users = await this.databaseService.query(
      'SELECT * FROM User WHERE email_id = ?',
      [email_id]
    );
    if (users.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
