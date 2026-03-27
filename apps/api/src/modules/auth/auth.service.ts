import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type AuthError, type Session, type User } from '@supabase/supabase-js';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

export interface AuthResponse {
  user: {
    id: string;
    email: string | undefined;
  };
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number | undefined;
    tokenType: string;
  } | null;
}

@Injectable()
export class AuthService {
  private readonly supabase;

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.supabase = createClient(
      this.config.getOrThrow<string>('app.SUPABASE_URL'),
      this.config.getOrThrow<string>('app.SUPABASE_SECRET_KEY'),
    );
  }

  async register(input: RegisterDto): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw this.mapRegisterError(error);
    }

    if (!data.user) {
      throw new BadRequestException('Unable to register user');
    }

    await this.usersService.createOrUpdateFromAuthUser({
      id: data.user.id,
      email: data.user.email ?? input.email,
    });

    return this.buildAuthResponse(data.user, data.session);
  }

  async login(input: LoginDto): Promise<AuthResponse> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw this.mapLoginError(error);
    }

    if (!data.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.createOrUpdateFromAuthUser({
      id: data.user.id,
      email: data.user.email ?? input.email,
    });

    return this.buildAuthResponse(data.user, data.session);
  }

  private buildAuthResponse(user: User, session: Session | null): AuthResponse {
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      session: session
        ? {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at,
            tokenType: session.token_type,
          }
        : null,
    };
  }

  private mapRegisterError(error: AuthError): HttpException {
    if (error.message.toLowerCase().includes('already')) {
      return new ConflictException('Email is already registered');
    }
    return new BadRequestException(error.message);
  }

  private mapLoginError(error: AuthError): HttpException {
    if (
      error.message.toLowerCase().includes('invalid login credentials') ||
      error.message.toLowerCase().includes('invalid_credentials')
    ) {
      return new UnauthorizedException('Invalid credentials');
    }
    return new BadRequestException(error.message);
  }
}
