import { IsString, IsInt, Min } from 'class-validator';

export class CreateAdminMeetingRoomDto {
    @IsString()
    room_name: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsInt()
  floor_number: number;
}