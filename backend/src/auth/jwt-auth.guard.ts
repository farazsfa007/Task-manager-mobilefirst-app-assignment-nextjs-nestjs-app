import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('JWT token is missing');
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'dev_secret_change_me',
      ) as {
        sub: string;
        email: string;
      };

      request.user = {
        userId: decoded.sub,
        email: decoded.email,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired JWT token');
    }
  }
}