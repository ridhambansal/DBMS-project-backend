import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { DatabaseService } from 'src/database/database.service';
import { CreateAdminMeetingRoomDto } from './dto/create-admin-meeting-room.dto';
import { UpdateAdminMeetingRoomDto } from './dto/update-admin-meeting-room.dto';

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

  async update(
    roomId: number,
    dto: UpdateAdminMeetingRoomDto,
  ): Promise<{
    room_id: number;
    room_name?: string;
    capacity?: number;
    floor_number?: number;
  }> {
    const sets: string[] = [];
    const params: any[] = [];

    if (dto.room_name !== undefined) {
      sets.push('room_name = ?');
      params.push(dto.room_name);
    }
    if (dto.capacity !== undefined) {
      sets.push('capacity = ?');
      params.push(dto.capacity);
    }
    if (dto.floor_number !== undefined) {
      sets.push('floor_number = ?');
      params.push(dto.floor_number);
    }

    if (sets.length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const sql = `
      UPDATE MeetingRoom
         SET ${sets.join(', ')}
       WHERE room_id = ?
    `;
    params.push(roomId);

    const result: any = await this.db.query(sql, params);
    if (result.affectedRows === 0) {
      throw new NotFoundException(`Meeting room ${roomId} not found`);
    }

    return {
      room_id:      roomId,
      room_name:    dto.room_name,
      capacity:     dto.capacity,
      floor_number: dto.floor_number,
    };
  }

  async findAll(): Promise<Array<{
    room_id: number;
    room_name: string;
    capacity: number;
    floor_number: number;
  }>> {
    const rows: any[] = await this.db.query(
      `SELECT room_id, room_name, capacity, floor_number
         FROM MeetingRoom`,
      [],
    );
    return rows.map(r => ({
      room_id:      r.room_id,
      room_name:    r.room_name,
      capacity:     r.capacity,
      floor_number: r.floor_number,
    }));
  }
}
