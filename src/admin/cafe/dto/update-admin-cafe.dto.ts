import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateAdminCafeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @IsString()
  contact_number?: string;

  @IsOptional()
  @IsInt()
  floor_number?: number;
}
