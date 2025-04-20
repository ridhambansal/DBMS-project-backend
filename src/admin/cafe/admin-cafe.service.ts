import { Injectable, Inject, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateAdminCafeDto } from './dto/create-admin-cafe.dto';
import { DatabaseService } from '../../database/database.service';
import { NotFoundException } from '@nestjs/common';
import { UpdateAdminCafeDto } from './dto/update-admin-cafe.dto';

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

  async findAll() {
    const rows: any[] = await this.databaseService.query(
      `SELECT name, cuisine, contact_number, floor_number
         FROM Cafe`,
      [],
    );
    return rows.map(r => ({
      name:            r.name,
      cuisine:         r.cuisine,
      contact_number:  r.contact_number,
      floor_number:    r.floor_number,
    }));
  }


  async update(
    currentName: string,
    dto: UpdateAdminCafeDto,
  ): Promise<{
    name: string;
    cuisine?: string;
    contact_number?: string;
    floor_number?: number;
  }> {
    const sets: string[] = [];
    const params: any[]   = [];

    if (dto.name !== undefined) {
      sets.push('name = ?');
      params.push(dto.name);
    }
    if (dto.cuisine !== undefined) {
      sets.push('cuisine = ?');
      params.push(dto.cuisine);
    }
    if (dto.contact_number !== undefined) {
      sets.push('contact_number = ?');
      params.push(dto.contact_number);
    }
    if (dto.floor_number !== undefined) {
      sets.push('floor_number = ?');
      params.push(dto.floor_number);
    }

    if (sets.length === 0) {
      throw new BadRequestException('No fields provided for update');
    }

    const sql = `
      UPDATE Cafe
         SET ${sets.join(', ')}
       WHERE name = ?
    `;
    params.push(currentName);

    try {
      const result: any = await this.databaseService.query(sql, params);

      if (result.affectedRows === 0) {
        throw new NotFoundException(`Cafe "${currentName}" not found`);
      }

      // return the new state
      return {
        name:           dto.name ?? currentName,
        cuisine:        dto.cuisine,
        contact_number: dto.contact_number,
        floor_number:   dto.floor_number,
      };

    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'A cafe with that name or contact number already exists',
        );
      }
      // re‑throw any other error
      throw err;
    }

    // ← add this so TS knows we never “fall off” without throwing or returning
    // (in practice we’ll never reach here)
    // tslint:disable-next-line:no-unreachable
    throw new InternalServerErrorException('Unexpected error updating cafe');
  }
}