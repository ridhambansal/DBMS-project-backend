import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { DatabaseService } from 'src/database/database.service';
import { CreateAdminMeetingRoomDto } from './dto/create-admin-meeting-room.dto';

@Injectable()
export class AdminMeetingRoomService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateAdminMeetingRoomDto) {
    // Destructure the exact keys you declared in the DTO:
    const { room_name, capacity, floor_number } = dto;

    // Debug log to verify:
    console.log('→ create payload:', { room_name, capacity, floor_number });

    const result = await this.db.query(
      `INSERT INTO MeetingRoom (room_name, capacity, floor_number)
       VALUES (?, ?, ?)`,
      [room_name, capacity, floor_number],
    );

    return {
      id: result.insertId,
      room_name,
      capacity,
      floor_number,
    };
  }
}
