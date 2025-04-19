import { PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto {
  event_name?:   string;
      date?:         Date;
      description?:  string;
      creator_id?:   number;
}