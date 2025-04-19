import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Request } from 'express';
  import { UsersService } from '../users/users.service';
  
  @Injectable()
  export class AdminGuard implements CanActivate {
    constructor(private userService: UsersService) {}
  
    async canActivate(ctx: ExecutionContext): Promise<boolean> {
      const req = ctx.switchToHttp().getRequest<Request>();
      const userIdHeader = req.header('x-user-id');
      console.log('→ x-user-id header:', userIdHeader);
      if (!userIdHeader) throw new ForbiddenException('Missing x-user-id header');
  
      const userId = parseInt(userIdHeader, 10);
      const user = await this.userService.findOne(userId);
      console.log('User fetched by guard:', user);
      if (!user || user.access_level_id !== 3) {
        throw new ForbiddenException('Admin access only');
      }
      req['user'] = user;
      return true;
    }
  }