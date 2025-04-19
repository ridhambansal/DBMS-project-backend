import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { DatabaseService } from 'src/database/database.service';
import { CreateAdminFloorDto } from './dto/create-admin-floor.dto';

@Injectable()
export class AdminFloorService {
  constructor(private databaseService: DatabaseService) {}

  async create(dto: CreateAdminFloorDto) {
    // destructure exactly what your DTO now defines:
    const { floor_number, floor_name, total_capacity } = dto;
    console.log('→ create floor payload:', dto);

    const result = await this.databaseService.query(
      `INSERT INTO \`Floor\` 
         (floor_number, floor_name, total_capacity)
       VALUES (?, ?, ?)`,
      [floor_number, floor_name, total_capacity],
    );

    return {
      id:              result.insertId,
      floor_number,
      floor_name,
      total_capacity,
    };
  }

}