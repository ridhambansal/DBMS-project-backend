import { IsInt, IsString } from 'class-validator';

export class CreateAdminCafeDto {
  @IsString()        name: string;
  @IsString()        cuisine: string;
  @IsString()        contact_number: string;
  @IsInt()           floor_number: number;
}