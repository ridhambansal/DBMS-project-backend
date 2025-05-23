// src/events/events.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventsService }    from './events.service';
import { CreateEventDto }   from './dto/create-event.dto';
import { UpdateEventDto }   from './dto/update-event.dto';
import { ApiTags }          from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  // returns upcoming events only
  @Get('upcoming')
  findByDate() {
    return this.eventsService.findByDate();
  }

  @Patch(':id')
  update(@Param('id') id: string,
         @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }
}
