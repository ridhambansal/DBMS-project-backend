import {
    Injectable,
    Inject,
    BadRequestException,
    NotFoundException,
  } from '@nestjs/common';
  import { Pool } from 'mysql2/promise';
  import { CreateSeatBookingDto } from './dto/create-seat_booking.dto';
  import { UpdateSeatBookingDto } from './dto/update-seat_booking.dto';



  @Injectable()
  export class SeatBookingService {
    constructor(@Inject('DATABASE_POOL') private pool: Pool) {}



    private toMysqlDatetime(iso: string): string {
        const dt = new Date(iso);
        const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
        return [
          dt.getUTCFullYear(),
          pad(dt.getUTCMonth() + 1),
          pad(dt.getUTCDate())
        ].join('-') + ' ' + [
          pad(dt.getUTCHours()),
          pad(dt.getUTCMinutes()),
          pad(dt.getUTCSeconds())
        ].join(':');
      }
  
    async create(dto: CreateSeatBookingDto) {
      const conn = await this.pool.getConnection();
      try {
        await conn.beginTransaction();
  
        // 1) Check if seat is already booked
        const [seatRows]: any = await conn.query(
          `SELECT is_booked
             FROM Seat
            WHERE seat_number = ? AND floor_number = ? 
            FOR UPDATE`,
          [dto.seat_number, dto.floor_number],
        );
        if (!seatRows.length) {
          throw new BadRequestException('Seat does not exist');
        }
        if (seatRows[0].is_booked) {
          throw new BadRequestException('Seat already booked');
        }
  
        // 2) Create a Booking

        const mysqlDate = this.toMysqlDatetime(dto.booking_date);
        const [bookingRes]: any = await conn.query(
          `INSERT INTO Booking 
             (amenity_type_id, booking_date, details, user_id)
           VALUES
             (
               (SELECT type_id FROM AmenityType WHERE type_name='Seat'),
               ?, ?, ?
             )`,
          [mysqlDate, dto.details, dto.user_id],
        );
        const bookingId = bookingRes.insertId;
  
        // 3) Link to SeatBooking
        await conn.query(
          `INSERT INTO SeatBooking (booking_id, seat_number, floor_number)
           VALUES (?, ?, ?)`,
          [bookingId, dto.seat_number, dto.floor_number],
        );
  
        // 4) Mark seat as booked
        await conn.query(
          `UPDATE Seat
              SET is_booked = TRUE
            WHERE seat_number = ? AND floor_number = ?`,
          [dto.seat_number, dto.floor_number],
        );
  
        await conn.commit();
        return { booking_id: bookingId, status: 'Seat booking successful' };
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }
  
    async findAll() {
      const [rows] = await this.pool.query(
        `SELECT sb.booking_id,
                sb.seat_number,
                sb.floor_number,
                b.booking_date,
                b.details,
                b.user_id
           FROM SeatBooking sb
      INNER JOIN Booking b ON sb.booking_id = b.booking_id`,
      );
      return rows;
    }
  
    async findOne(id: number) {
      const [rows]: any = await this.pool.query(
        `SELECT sb.booking_id,
                sb.seat_number,
                sb.floor_number,
                b.booking_date,
                b.details,
                b.user_id
           FROM SeatBooking sb
      INNER JOIN Booking b ON sb.booking_id = b.booking_id
          WHERE sb.booking_id = ?`,
        [id],
      );
      if (!rows.length) {
        throw new NotFoundException(`SeatBooking ${id} not found`);
      }
      return rows[0];
    }
  
    // async update(id: number, dto: UpdateSeatBookingDto) {
    //   // Only allow updating booking_date, details, user_id
    //   const fields : string[]= [];
    //   const params: Array<string | number> = [];
    //   if (dto.booking_date) {
    //     fields.push('booking_date = ?');
    //     params.push(this.toMysqlDatetime(dto.booking_date));
    //   }
    //   if (dto.details) {
    //     fields.push('details = ?');
    //     params.push(dto.details);
    //   }
    //   if (dto.user_id) {
    //     fields.push('user_id = ?');
    //     params.push(dto.user_id);
    //   }
    //   if (!fields.length) {
    //     throw new BadRequestException('Nothing to update');
    //   }
    //   params.push(id);
  
    //   const [res]: any = await this.pool.query(
    //     `UPDATE Booking
    //         SET ${fields.join(', ')}
    //       WHERE booking_id = ?`,
    //     params,
    //   );
    //   if (res.affectedRows === 0) {
    //     throw new NotFoundException(`SeatBooking ${id} not found`);
    //   }
    //   return this.findOne(id);
    // }

    async update(id: number, dto: UpdateSeatBookingDto) {
        const conn = await this.pool.getConnection();
        try {
          await conn.beginTransaction();
      
          // 1) Load existing SeatBooking & Booking
          const [origRows]: any = await conn.query(
            `SELECT sb.seat_number, sb.floor_number
               FROM SeatBooking sb
              WHERE sb.booking_id = ?`,
            [id],
          );
          if (!origRows.length) {
            throw new NotFoundException(`Booking ${id} not found`);
          }
          const { seat_number: oldSeat, floor_number: oldFloor } = origRows[0];
      
          // 2) If seat/floor is changing, free old & reserve new
          const newSeat  = dto.seat_number  ?? oldSeat;
          const newFloor = dto.floor_number ?? oldFloor;
          if (newSeat !== oldSeat || newFloor !== oldFloor) {
            // free old
            await conn.query(
              `UPDATE Seat SET is_booked = FALSE
                 WHERE seat_number = ? AND floor_number = ?`,
              [oldSeat, oldFloor],
            );
      
            // check availability of new
            const [avail]: any = await conn.query(
              `SELECT is_booked FROM Seat
                 WHERE seat_number = ? AND floor_number = ?
                   FOR UPDATE`,
              [newSeat, newFloor],
            );
            if (!avail.length) {
              throw new BadRequestException('New seat does not exist');
            }
            if (avail[0].is_booked) {
              throw new BadRequestException('New seat already booked');
            }
      
            // reserve new
            await conn.query(
              `UPDATE Seat SET is_booked = TRUE
                 WHERE seat_number = ? AND floor_number = ?`,
              [newSeat, newFloor],
            );
      
            // update the SeatBooking row
            await conn.query(
              `UPDATE SeatBooking
                  SET seat_number = ?, floor_number = ?
                WHERE booking_id = ?`,
              [newSeat, newFloor, id],
            );
          }
      
          // 3) Update Booking fields if present
          const fields: string[] = [];
          const params: Array<string|number> = [];
          if (dto.booking_date) {
            fields.push('booking_date = ?');
            params.push(this.toMysqlDatetime(dto.booking_date));
          }
          if (dto.details) {
            fields.push('details = ?');
            params.push(dto.details);
          }
          if (dto.user_id) {
            fields.push('user_id = ?');
            params.push(dto.user_id);
          }
          if (fields.length) {
            params.push(id);
            const sql = `UPDATE Booking SET ${fields.join(', ')} WHERE booking_id = ?`;
            await conn.query(sql, params);
          }
      
          await conn.commit();
          return this.findOne(id);
      
        } catch (err) {
          await conn.rollback();
          throw err;
        } finally {
          conn.release();
        }
      }
  
    async remove(id: number) {
      const conn = await this.pool.getConnection();
      try {
        await conn.beginTransaction();
  
        // 1) Find which seat to free
        const [rows]: any = await conn.query(
          `SELECT seat_number, floor_number
             FROM SeatBooking
            WHERE booking_id = ?`,
          [id],
        );
        if (!rows.length) {
          throw new NotFoundException(`SeatBooking ${id} not found`);
        }
        const { seat_number, floor_number } = rows[0];
  
        // 2) Free the seat
        await conn.query(
          `UPDATE Seat
              SET is_booked = FALSE
            WHERE seat_number = ? AND floor_number = ?`,
          [seat_number, floor_number],
        );
  
        // 3) Delete from Booking (cascade removes SeatBooking)
        await conn.query(`DELETE FROM Booking WHERE booking_id = ?`, [id]);
  
        await conn.commit();
        return { status: 'Booking successfully canceled' };
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }
  }
  