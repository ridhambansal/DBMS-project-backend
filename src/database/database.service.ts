import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2/promise';

@Injectable()
export class DatabaseService {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'Utkarsh321',
      database: 'office_management',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const [results] = await this.pool.query(sql, params);
    return results;
  }

  async execute<T extends RowDataPacket[] | ResultSetHeader = RowDataPacket[]>(
    sql: string,
    params: any[] = [],
  ): Promise<[T, FieldPacket[]]> {
    // Tell TS that pool.execute will indeed return [T, FieldPacket[]]
    const [result, fields] = await this.pool.execute<T>(sql, params);
    return [result, fields];
  }

  async getConnection(): Promise<mysql.PoolConnection> {
    return this.pool.getConnection();
  }
}
