import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { createClient } from '@supabase/supabase-js';

interface SupabaseJwtPayload {
  sub: string;
  email: string;
  role: string;
  aud: string;
}

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly supabase;

  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Supabase publishes its JWT secret as a JWKS endpoint; for HS256 use the secret directly
      secretOrKey: config.getOrThrow<string>('app.SUPABASE_JWT_SECRET'),
    });

    this.supabase = createClient(
      config.getOrThrow<string>('app.SUPABASE_URL'),
      config.getOrThrow<string>('app.SUPABASE_SECRET_KEY'),
    );
  }

  validate(payload: SupabaseJwtPayload): { id: string; email: string } {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return { id: payload.sub, email: payload.email };
  }
}
