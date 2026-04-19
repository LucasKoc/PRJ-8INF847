import {
  Body,
  Controller,
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
import { OptionalAuth, Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

@ApiTags('tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournaments: TournamentsService) {}

  /**
   * Public listing — but a signed-in TO also sees their own DRAFT tournaments.
   * @OptionalAuth extracts the JWT if present, skips auth if not.
   */
  @UseGuards(JwtAuthGuard)
  @OptionalAuth()
  @Get()
  @ApiOperation({ summary: 'List tournaments (DRAFT hidden except to the organizing TO)' })
  findAll(@CurrentUser() user?: JwtPayload) {
    return this.tournaments.findAll(user ? String(user.sub) : undefined);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a tournament with its registrations (public)' })
  findOne(@Param('id') id: string) {
    return this.tournaments.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TO)
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a tournament in DRAFT status (TO only)' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTournamentDto) {
    return this.tournaments.create(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TO)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a DRAFT tournament (organizing TO only)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTournamentDto,
  ) {
    return this.tournaments.update(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TO)
  @ApiBearerAuth()
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Change tournament status',
    description:
      'Allowed: DRAFT→OPEN, DRAFT→CANCELLED, OPEN→CLOSED, OPEN→CANCELLED, CLOSED→COMPLETED',
  })
  changeStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.tournaments.changeStatus(id, user.sub, dto.status);
  }

  /**
   * TBD — Bracket system is deferred to V2.
   * Returns 501 Not Implemented with a clear message for the frontend.
   */
  @Public()
  @Get(':id/bracket')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({
    summary: 'Bracket — not implemented in V1',
    description: 'The bracket system is planned for V2. Endpoint returns 501.',
  })
  getBracket(@Param('id') id: string) {
    return {
      statusCode: 501,
      feature: 'bracket_system',
      tournamentId: id,
      message:
        'The bracket system will be available in a future version. Bracket auto-generation and visual tree display are not yet implemented.',
    };
  }
}
