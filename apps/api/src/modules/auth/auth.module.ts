import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './supabase.strategy';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [SupabaseStrategy, AuthGuard],
  exports: [AuthGuard, PassportModule],
})
export class AuthModule {}
