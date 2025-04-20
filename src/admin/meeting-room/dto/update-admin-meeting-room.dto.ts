import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateAdminMeetingRoomDto {
  @IsOptional()
  @IsString()
  room_name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsInt()
  floor_number?: number;
}
