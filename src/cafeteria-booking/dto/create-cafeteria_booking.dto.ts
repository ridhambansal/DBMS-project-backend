import { ApiProperty } from '@nestjs/swagger';

export class CreateCafeteriaBookingDto {

    @ApiProperty({ description: 'ID of the user making the booking' })
  user_id: number;
  
  @ApiProperty({ description: 'Name of the cafe to book' })
  cafe_name: string;

  @ApiProperty({ type: String, format: 'date-time', description: 'When the booking is for' })
  booking_date: Date;

  @ApiProperty({ description: 'Any additional details' })
  details: string;
}
