import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './supabase.strategy';
import { AuthGuard } from './auth.guard';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), UsersModule],
  controllers: [AuthController],
  providers: [SupabaseStrategy, AuthGuard, AuthService],
  exports: [AuthGuard, PassportModule, AuthService],
})
export class AuthModule {}
