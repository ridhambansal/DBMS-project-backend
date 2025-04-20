import { Controller, Get, Param } from '@nestjs/common';
import { FloorService } from './floor.service';

@Controller('floors')
export class FloorController {
  constructor(private readonly svc: FloorService) {}

  @Get()
  async getFloors() {
    return this.svc.getFloors();
  }

  @Get(':floor_number/seats/available')
  getAvailableSeats(
    @Param('floor_number') floor: string,
  ): Promise<{ seat_number: number }[]> {
    const floorNum = parseInt(floor, 10);
    return this.svc.getAvailableSeats(floorNum);
  }
}
