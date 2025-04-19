import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createPool, Pool } from 'mysql2/promise';
import { FloorService } from './floor.service';
import { FloorController } from './floor.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FloorController],
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: async (config: ConfigService): Promise<Pool> =>
        createPool({
            host: config.get<string>('DB_HOST', 'localhost'),
            port: config.get<number>('DB_PORT', 3306),
            user: config.get<string>('DB_USER', 'root'),
            password: config.get<string>('DB_PASS', 'Utkarsh321'),
            database: config.get<string>('DB_NAME', 'office_management'),
            connectionLimit: 10,
        }),
      inject: [ConfigService],
    },
    FloorService,
  ],
})
export class FloorModule {}