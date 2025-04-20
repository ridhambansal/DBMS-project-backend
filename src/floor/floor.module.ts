import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createPool, Pool } from 'mysql2/promise';
import { FloorService } from './floor.service';
import { FloorController } from './floor.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FloorController],
  providers: [
    FloorService,
  ],
})
export class FloorModule {}