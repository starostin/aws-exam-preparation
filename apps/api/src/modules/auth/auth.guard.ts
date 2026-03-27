import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import type { Request } from 'express';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly supabase;

  constructor(private readonly config: ConfigService) {
    this.supabase = createClient(
      this.config.getOrThrow<string>('app.SUPABASE_URL'),
      this.config.getOrThrow<string>('app.SUPABASE_SECRET_KEY'),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();

    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authorization.slice(7).trim();
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = {
      id: data.user.id,
      email: data.user.email ?? '',
    };

    return true;
  }
}
