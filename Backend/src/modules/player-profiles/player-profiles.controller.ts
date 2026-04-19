import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { CreatePlayerProfileDto } from './dto/create-player-profile.dto';
import { UpdatePlayerProfileDto } from './dto/update-player-profile.dto';
import { PlayerProfilesService } from './player-profiles.service';

@ApiTags('player-profiles')
@ApiBearerAuth()
@Controller('player-profiles')
export class PlayerProfilesController {
  constructor(private readonly profilesService: PlayerProfilesService) {}

  @Get()
  findAll() {
    return this.profilesService.findAll();
  }

  @Get('me')
  @Roles(UserRole.PLAYER)
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.profilesService.findByUserId(user.userId);
  }

  @Get('by-user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.profilesService.findByUserId(userId);
  }

  @Post()
  @Roles(UserRole.PLAYER)
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePlayerProfileDto) {
    return this.profilesService.create(user.userId, dto);
  }

  @Patch('me')
  @Roles(UserRole.PLAYER)
  update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePlayerProfileDto) {
    return this.profilesService.update(user.userId, dto);
  }

  @Delete('me')
  @Roles(UserRole.PLAYER)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthenticatedUser) {
    return this.profilesService.remove(user.userId);
  }
}
