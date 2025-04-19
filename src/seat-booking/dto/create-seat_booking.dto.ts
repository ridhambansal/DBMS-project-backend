import { IsInt, IsDateString, IsString, Min } from 'class-validator';

export class CreateSeatBookingDto {
  @IsInt() @Min(1)
  user_id: number;

  @IsInt() @Min(1)
  seat_number: number;

  @IsInt() @Min(1)
  floor_number: number;

  @IsDateString()
  booking_date: string;

  @IsString()
  details: string;
}
