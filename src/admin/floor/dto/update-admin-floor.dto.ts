import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateAdminFloorDto {
  @IsOptional()
  @IsString()
  floor_name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  total_capacity?: number;
}
