// src/events/dto/create-event.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class CreateEventDto {
  @ApiProperty()       event_name: string;
  @ApiProperty()       date: Date;
  @ApiProperty()       description: string;
  @ApiProperty()       creator_id: number;  // new!
}
