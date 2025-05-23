import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { createPool, Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CheckCafeAvailabilityDto } from './dto/check-availability.dto';
import { CreateCafeteriaBookingDto } from './dto/create-cafeteria_booking.dto';
import * as mysql from 'mysql2/promise';
import { UpdateCafeteriaBookingDto } from './dto/update-cafeteria_booking.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CafeteriaBookingService {

  constructor(private databaseService: DatabaseService) {
  }

  /**
   * Calls your BookCafe stored procedure:
   *   BookCafe(IN p_user_id, IN p_cafe_name, IN p_booking_date, IN p_details)
   */
  async bookCafe(userId: number, dto: CreateCafeteriaBookingDto) {
    try {
      // NOTE: MySQL procedures return an array of result‑sets;
      const d = new Date(dto.booking_date);
    const mysqlDateStr = d.toISOString().slice(0, 19).replace('T', ' '); 

    await this.assertAvailable(dto.cafe_name, mysqlDateStr);
      // the first one is our SELECT at the end of the proc.
      const [rows] = await this.databaseService.query(
        'CALL BookCafe(?, ?, ?, ?)',
        [userId, dto.cafe_name, mysqlDateStr, dto.details],
      );
      // rows[0] will be something like: { 'Booking ID': x, Status: 'Cafe booking successful' }
      return Array.isArray(rows) ? rows[0] : rows;
    } catch (err: any) {
        console.error('BookCafe error:', err);
        // expose the SQL message in the 500 for now
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  private async assertAvailable(
       cafe_name: string,
       mysqlDate: string,
       excludeBookingId?: number,
     ) {
       const params: any[] = [cafe_name, mysqlDate];
       let sql = `
         SELECT COUNT(*) AS cnt
           FROM Booking b
           JOIN CafeBooking cb ON b.booking_id = cb.booking_id
          WHERE cb.cafe_name = ?
            AND b.booking_date = ?
       `;
       if (excludeBookingId) {
         sql += ' AND b.booking_id <> ?';
         params.push(excludeBookingId);
       }
       const [rows] = await this.databaseService.execute<RowDataPacket[]>(sql, params);
       if ((rows[0]?.cnt as number) > 0) {
         throw new ConflictException('That café slot is already booked');
       }
     }

  async updateBooking(
    bookingId: number,
    dto: UpdateCafeteriaBookingDto,
  ): Promise<{ success: boolean }> {
    const fields: string[] = [];
    const params: any[]   = [];

    if (!dto.cafe_name) {
      throw new BadRequestException('cafe_name is required when updating booking_date');
    }

    // convert an ISO date to "YYYY-MM-DD HH:MM:SS"
    if (dto.booking_date) {
      const d = new Date(dto.booking_date);
      const mysqlDate = d
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

        await this.assertAvailable(dto.cafe_name , mysqlDate, bookingId);
      fields.push('booking_date = ?');
      params.push(mysqlDate);
    }

    if (dto.details) {
      fields.push('details = ?');
      params.push(dto.details);
    }

    if (!fields.length) {
      throw new BadRequestException('No fields to update');
    }

    // only allow the booking owner to update
    const sql = `
      UPDATE Booking
         SET ${fields.join(', ')}
       WHERE booking_id = ?
         AND user_id    = ?
    `;
    params.push(bookingId, dto.user_id);

    try {
      const [res] = await this.databaseService.execute<ResultSetHeader>(sql, params);
      if (res.affectedRows === 0) {
        throw new NotFoundException(
          'Booking not found or you are not the owner',
        );
      }
      return { success: true };
    } catch (err: any) {
        // If we already threw an HttpException (404, 400), re-throw it as-is:
        if (err instanceof HttpException) {
          throw err;
        }
        // Otherwise wrap in a 500
        throw new InternalServerErrorException(err.message);
      }
  }

  async isAvailable(dto: CheckCafeAvailabilityDto) {
    try {

      const [rows] = await this.databaseService.execute<RowDataPacket[]>(
        `
        SELECT COUNT(*) AS cnt
          FROM Booking b
          JOIN CafeBooking cb ON b.booking_id = cb.booking_id
         WHERE cb.cafe_name = ? AND b.booking_date = ?
        `,
        [dto.cafe_name, dto.booking_date],
      );

      const cnt = (rows[0]?.cnt as number) ?? 0;
      return { available: cnt === 0 };
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to check café availability',
        err as any,
      );
    }
  }



  // If you have other stored‑procs you want to call, e.g. to cancel:
  async cancelBooking(bookingId: number, userId: number) {
    try {
      const [rows] = await this.databaseService.query(
        'CALL CancelBooking(?, ?)',
        [bookingId, userId],
      );
      return Array.isArray(rows) ? rows[0] : rows;
    } catch (err) {console.error('CancelBooking error:', err);
    // return the SQL/SIGNAL message directly
    throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCafes(): Promise<
    { name: string; cuisine: string; contact_number: string; floor_number: number }[]
  > {
    const [rows] = await this.databaseService.execute<RowDataPacket[]>(
      `SELECT name, cuisine, contact_number, floor_number FROM Cafe`
    );
    return rows as any;
  }


  async getBookingsByUser(userId: number): Promise<
    { booking_id: number;
      cafe_name: string;
      booking_date: string;
      details: string;
    }[]
  > {
    const [rows] = await this.databaseService.execute<RowDataPacket[]>(
      `
      SELECT b.booking_id,
             cb.cafe_name,
             b.booking_date,
             b.details
        FROM Booking b
        JOIN CafeBooking cb ON b.booking_id = cb.booking_id
       WHERE b.user_id = ?
      `,
      [userId],
    );
    return rows as any;
  }
}
