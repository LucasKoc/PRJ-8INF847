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
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentsService } from './tournaments.service';

@ApiTags('tournaments')
@ApiBearerAuth()
@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  findAll() {
    return this.tournamentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findById(id);
  }

  @Post()
  @Roles(UserRole.TO)
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTournamentDto,
  ) {
    return this.tournamentsService.create(user.userId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.TO)
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateTournamentDto,
  ) {
    return this.tournamentsService.update(id, user.userId, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.TO)
  changeStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.tournamentsService.changeStatus(id, user.userId, dto.status);
  }

  @Delete(':id')
  @Roles(UserRole.TO)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.tournamentsService.remove(id, user.userId);
  }
}
