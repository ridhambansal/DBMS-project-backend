import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MeetingRoomsService {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    console.log('Service: findAll called');
    return this.databaseService.query(`
      SELECT r.room_id, r.room_name, r.capacity, r.floor_number, f.floor_name
      FROM MeetingRoom r
      JOIN Floor f ON r.floor_number = f.floor_number
      ORDER BY r.floor_number, r.room_name
    `);
  }

  async findOne(id: number) {
    console.log(`Service: findOne called with id: ${id}`);
    
    // Check if id is valid
    if (id === undefined || id === null || isNaN(id)) {
      throw new NotFoundException(`Invalid meeting room ID provided`);
    }

    const rooms = await this.databaseService.query(`
      SELECT r.room_id, r.room_name, r.capacity, r.floor_number, f.floor_name
      FROM MeetingRoom r
      JOIN Floor f ON r.floor_number = f.floor_number
      WHERE r.room_id = ?
    `, [id]);

    if (rooms.length === 0) {
      throw new NotFoundException(`Meeting room with ID ${id} not found`);
    }

    return rooms[0];
  }

  async bookRoom(bookingData: any) {
    console.log('Service: bookRoom called with data:', bookingData);
    const { user_id, room_id, booking_date, details, participants } = bookingData;

    try {
      // Format date for MySQL if needed
      const date = new Date(booking_date);
      const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
      
      console.log(`Formatted date: ${formattedDate}`);
      console.log(`Calling stored procedure with params: ${user_id}, ${room_id}, ${formattedDate}, ${details}, ${participants ? JSON.stringify(participants) : null}`);
      
      // Call the stored procedure to book the meeting room
      const result = await this.databaseService.query(
        'CALL BookMeetingRoom(?, ?, ?, ?, ?)',
        [user_id, room_id, formattedDate, details, participants ? JSON.stringify(participants) : null]
      );

      return result[0][0];
    } catch (error) {
      console.error('Error in bookRoom:', error);
      throw new BadRequestException(`Failed to book meeting room: ${error.message}`);
    }
  }

  async getBookings(userId: number | null, date: string | null) {
    console.log(`Service: getBookings called with userId: ${userId}, date: ${date}`);
    
    try {
      let query = `
        SELECT b.booking_id, b.booking_date, b.details, 
               mrb.room_id, mr.room_name, mr.capacity, mr.floor_number, f.floor_name,
               u.user_id, u.first_name, u.last_name, u.email_id
        FROM Booking b
        JOIN MeetingRoomBooking mrb ON b.booking_id = mrb.booking_id
        JOIN MeetingRoom mr ON mrb.room_id = mr.room_id
        JOIN Floor f ON mr.floor_number = f.floor_number
        JOIN User u ON b.user_id = u.user_id
        WHERE 1=1
      `;

      const params: (number | string)[] = [];

      if (userId) {
        query += ` AND (b.user_id = ? OR mrb.booking_id IN (
          SELECT booking_id FROM MeetingRoomParticipant WHERE user_id = ?
        ))`;
        params.push(userId, userId);
      }

      if (date) {
        query += ` AND DATE(b.booking_date) = DATE(?)`;
        params.push(date);
      }

      query += ` ORDER BY b.booking_date`;

      console.log('Executing query:', query, 'with params:', params);

      const bookings = await this.databaseService.query(query, params);
      console.log(`Found ${bookings.length} bookings`);
      
      // Get participants for each booking
      for (const booking of bookings) {
        try {
          const participants = await this.databaseService.query(`
            SELECT mrp.user_id, u.first_name, u.last_name, u.email_id
            FROM MeetingRoomParticipant mrp
            JOIN User u ON mrp.user_id = u.user_id
            WHERE mrp.booking_id = ?
          `, [booking.booking_id]);
          
          booking.participants = participants || [];
          console.log(`Found ${participants.length} participants for booking ${booking.booking_id}`);
        } catch (error) {
          console.error(`Error fetching participants for booking ${booking.booking_id}:`, error);
          booking.participants = [];
        }
      }

      return bookings;
    } catch (error) {
      console.error('Error in getBookings:', error);
      throw error;
    }
  }

  async cancelBooking(id: number) {
    console.log(`Service: cancelBooking called with id: ${id}`);
    
    try {
      // Check if id is valid
      if (id === undefined || id === null || isNaN(id)) {
        throw new BadRequestException('Invalid booking ID provided');
      }
      
      // Get booking info first to check if it exists
      const bookings = await this.databaseService.query(
        'SELECT booking_id, user_id FROM Booking WHERE booking_id = ?',
        [id]
      );

      console.log('Bookings found:', bookings);

      if (bookings.length === 0) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      // Call the stored procedure to cancel the booking
      console.log(`Executing: CALL CancelBooking(${id}, ${bookings[0].user_id})`);
      
      // Instead of calling the stored procedure directly, let's handle the cancellation in code
      // This gives us more control and better error handling
      
      // Begin a transaction
      await this.databaseService.query('START TRANSACTION');
      
      try {
        // Check if this is a seat booking that needs to update the seat status
        const seatBooking = await this.databaseService.query(
          `SELECT sb.seat_number, sb.floor_number 
           FROM SeatBooking sb 
           JOIN Booking b ON sb.booking_id = b.booking_id
           JOIN AmenityType at ON b.amenity_type_id = at.type_id
           WHERE sb.booking_id = ? AND at.type_name = 'Seat'`,
          [id]
        );
        
        if (seatBooking.length > 0) {
          await this.databaseService.query(
            'UPDATE Seat SET is_booked = FALSE WHERE seat_number = ? AND floor_number = ?',
            [seatBooking[0].seat_number, seatBooking[0].floor_number]
          );
        }
        
        // Delete meeting room participants if they exist
        await this.databaseService.query(
          'DELETE FROM MeetingRoomParticipant WHERE booking_id = ?',
          [id]
        );
        
        // Delete meeting room booking if it exists
        await this.databaseService.query(
          'DELETE FROM MeetingRoomBooking WHERE booking_id = ?',
          [id]
        );
        
        // Delete seat booking if it exists
        await this.databaseService.query(
          'DELETE FROM SeatBooking WHERE booking_id = ?',
          [id]
        );
        
        // Delete cafe booking if it exists
        await this.databaseService.query(
          'DELETE FROM CafeBooking WHERE booking_id = ?',
          [id]
        );
        
        // Finally delete the main booking
        await this.databaseService.query(
          'DELETE FROM Booking WHERE booking_id = ?',
          [id]
        );
        
        // Commit the transaction
        await this.databaseService.query('COMMIT');
        
        return { message: 'Booking cancelled successfully' };
      } catch (error) {
        // Rollback the transaction if there's an error
        await this.databaseService.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error in cancelBooking:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to cancel booking: ${error.message}`);
    }
  }
}