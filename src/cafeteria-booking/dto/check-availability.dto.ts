import { ApiProperty } from '@nestjs/swagger';

export class CheckCafeAvailabilityDto {
  @ApiProperty({ description: 'The café to check' })
  cafe_name: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Desired booking date/time',
  })
  booking_date: Date;
}
