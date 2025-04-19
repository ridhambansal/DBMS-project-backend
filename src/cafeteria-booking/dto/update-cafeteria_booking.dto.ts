import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCafeteriaBookingDto {
  @ApiProperty({ description: 'ID of the user owning the booking' })
  user_id: number;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'New booking datetime, in ISO format',
  })
  booking_date?: Date;

  @ApiPropertyOptional({ description: 'New details text' })
  details?: string;

  @ApiPropertyOptional({ description: 'Name of the cafe' })
 cafe_name?: string;
}
