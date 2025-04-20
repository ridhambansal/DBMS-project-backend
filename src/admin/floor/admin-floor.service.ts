import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { DatabaseService } from 'src/database/database.service';
import { CreateAdminFloorDto } from './dto/create-admin-floor.dto';
import { UpdateAdminFloorDto } from './dto/update-admin-floor.dto';

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

  async update(
    floorNumber: number,
    dto: UpdateAdminFloorDto,
  ): Promise<{
    floor_number: number;
    floor_name?: string;
    total_capacity?: number;
  }> {
    // build SET clauses only for provided fields
    const sets: string[] = [];
    const params: any[] = [];

    if (dto.floor_name !== undefined) {
      sets.push('floor_name = ?');
      params.push(dto.floor_name);
    }
    if (dto.total_capacity !== undefined) {
      sets.push('total_capacity = ?');
      params.push(dto.total_capacity);
    }

    if (sets.length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const sql = `
      UPDATE \`Floor\`
         SET ${sets.join(', ')}
       WHERE floor_number = ?
    `;
    params.push(floorNumber);

    const result: any = await this.databaseService.query(sql, params);
    if (result.affectedRows === 0) {
      throw new NotFoundException(`Floor ${floorNumber} not found`);
    }

    return {
      floor_number: floorNumber,
      ...dto,
    };
  }

  async findAll(): Promise<Array<{
    floor_number: number;
    floor_name: string;
    total_capacity: number;
  }>> {
    const rows: any[] = await this.databaseService.query(
      `SELECT floor_number, floor_name, total_capacity
         FROM \`Floor\``,
      [],
    );
    return rows.map(r => ({
      floor_number:   r.floor_number,
      floor_name:     r.floor_name,
      total_capacity: r.total_capacity,
    }));
  }
}
