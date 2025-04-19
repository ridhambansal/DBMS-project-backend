// src/events/events.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateEventDto }  from './dto/create-event.dto';
import { UpdateEventDto }  from './dto/update-event.dto';
// import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly databaseService: DatabaseService,
    // private readonly notificationService: NotificationService,
  ) {}

  async create(createEventDto: CreateEventDto) {
    const { event_name, date, description, creator_id } = createEventDto;

    // send notifications
    // this.notificationService.sendNotificationToAllUsers(
    //   'New Event Created',
    //   `${event_name} at ${new Date(date).toLocaleString()}`
    // );

    // insert into MySQL

    const raw = typeof date === 'string' ? date : date.toISOString();
const mysqlDate = raw
  .replace('T', ' ')
  .replace('Z', '')
  .slice(0, 19);

    const result: any = await this.databaseService.query(
      `INSERT INTO Event (event_name, event_date, description, creator_id)
       VALUES (?, ?, ?, ?)`,
      [event_name, mysqlDate, description, creator_id],
    );

    return {
      id: result.insertId,
      event_name,
      date,
      description,
      creator_id,
    };
  }

  async findAll() {
    return await this.databaseService.query(
      `SELECT id, event_name, event_date AS date, description, creator_id
       FROM Event`
    );
  }

  async findByDate() {
    const now = new Date();
    return await this.databaseService.query(
      `SELECT id, event_name, event_date AS date, description, creator_id
       FROM Event
       WHERE event_date >= ?
       ORDER BY event_date`,
      [now],
    );
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    // …existence check…
  
    const sets: string[] = [];
    const params: any[]  = [];
  
    if (updateEventDto.event_name !== undefined) {
      sets.push(`event_name = ?`);
      params.push(updateEventDto.event_name);
    }
  
    if (updateEventDto.date !== undefined) {
      const dateObj = typeof updateEventDto.date === 'string'
        ? new Date(updateEventDto.date)
        : updateEventDto.date;
      if (isNaN(dateObj.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      sets.push(`event_date = ?`);
      params.push(dateObj);
    }
  
    if (updateEventDto.description !== undefined) {
      sets.push(`description = ?`);
      params.push(updateEventDto.description);
    }
  
    if (updateEventDto.creator_id !== undefined) {
      sets.push(`creator_id = ?`);
      params.push(updateEventDto.creator_id);
    }
  
    if (sets.length) {
      params.push(id);
      await this.databaseService.query(
        `UPDATE Event SET ${sets.join(', ')} WHERE id = ?`,
        params,
      );
    }
  
    const [updated] = await this.databaseService.query(
      `SELECT id, event_name, event_date AS date, description, creator_id
       FROM Event WHERE id = ?`,
      [id],
    );
    return updated;
  }

  async remove(id: number) {
    const result: any = await this.databaseService.query(
      `DELETE FROM Event WHERE id = ?`, [id]
    );
    if (result.affectedRows === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return { message: 'Event deleted successfully' };
  }
}
