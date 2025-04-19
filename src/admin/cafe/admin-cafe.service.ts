import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { CreateAdminCafeDto } from './dto/create-admin-cafe.dto';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AdminCafeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(dto: CreateAdminCafeDto) {
    // ← object destructuring, not array
    const { name, cuisine, contact_number, floor_number } = dto;

    console.log('→ create cafe payload:', { name, cuisine, contact_number, floor_number });

    try {
      const result = await this.databaseService.query(
        `INSERT INTO Cafe (name, cuisine, contact_number, floor_number)
         VALUES (?, ?, ?, ?)`,
        [name, cuisine, contact_number, floor_number],
      );
      return {
        id:               result.insertId,
        name,
        cuisine,
        contact_number,
        floor_number,
      };
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('A cafe with that contact number already exists');
      }
      throw err;
    }
  }
}