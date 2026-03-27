import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateProfileDto } from './update-profile.dto';
import { UsersService, type UserProfile } from './users.service';

@Controller({ path: 'users', version: '1' })
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  async sync(@CurrentUser() user: AuthUser): Promise<UserProfile> {
    return this.usersService.createOrUpdateFromAuthUser(user);
  }

  @Get('me')
  async getMe(@CurrentUser() user: AuthUser): Promise<UserProfile> {
    return this.usersService.getMe(user);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateProfileDto,
  ): Promise<UserProfile> {
    return this.usersService.updateMe(user.id, body.displayName ?? null);
  }
}
