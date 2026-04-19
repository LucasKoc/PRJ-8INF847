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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../common/enums';
import { PlayerProfilesService } from './player-profiles.service';
import { CreatePlayerProfileDto } from './dto/create-player-profile.dto';
import { UpdatePlayerProfileDto } from './dto/update-player-profile.dto';

@ApiTags('player-profiles')
@Controller('player-profiles')
export class PlayerProfilesController {
  constructor(private readonly profiles: PlayerProfilesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get my player profile' })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.profiles.findMine(user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLAYER)
  @ApiBearerAuth()
  @Post('me')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create my player profile (PLAYER role only)' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePlayerProfileDto) {
    return this.profiles.create(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLAYER)
  @ApiBearerAuth()
  @Patch('me')
  @ApiOperation({ summary: 'Update my player profile' })
  update(@CurrentUser() user: JwtPayload, @Body() dto: UpdatePlayerProfileDto) {
    return this.profiles.update(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLAYER)
  @ApiBearerAuth()
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete my player profile' })
  remove(@CurrentUser() user: JwtPayload) {
    return this.profiles.remove(user.sub);
  }

  @Public()
  @Get(':userId')
  @ApiOperation({ summary: 'Get a player profile by user id (public)' })
  findOne(@Param('userId') userId: string) {
    return this.profiles.findByUserId(userId);
  }
}
