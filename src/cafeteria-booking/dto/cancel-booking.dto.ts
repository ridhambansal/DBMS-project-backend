import { ApiProperty } from '@nestjs/swagger';

export class CancelBookingDto {
  @ApiProperty({ description: 'ID of the user cancelling the booking' })
  user_id: number;
}