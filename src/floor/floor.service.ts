import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class FloorService {
  constructor(private databaseService: DatabaseService) {}

  // Fetch all floor numbers
  async getFloors(): Promise<{ floor_number: number }[]> {
    const rows = await this.databaseService.query(
      `SELECT floor_number 
         FROM Floor 
        ORDER BY floor_number`
    );
    return rows as { floor_number: number }[];
  }

  // Fetch seats not yet booked on a given floor
  async getAvailableSeats(
    floor_number: number,
  ): Promise<{ seat_number: number }[]> {
    const rows = await this.databaseService.query(
      `SELECT seat_number
         FROM Seat
        WHERE floor_number = ? AND is_booked = FALSE
        ORDER BY seat_number`,
      [floor_number],
    );
    return rows as { seat_number: number }[];
  }
}
