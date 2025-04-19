import { IsInt, Min, IsString } from 'class-validator';

export class CreateAdminFloorDto {
    @IsInt()
    floor_number: number;
  
    @IsString()
    floor_name: string;
  
    @IsInt()
    @Min(0)
    total_capacity: number;
}