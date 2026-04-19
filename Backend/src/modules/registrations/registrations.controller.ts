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
import { RegisterTeamDto } from './dto/register-team.dto';
import { ReviewRegistrationDto } from './dto/review-registration.dto';
import { RegistrationsService } from './registrations.service';

@ApiTags('registrations')
@ApiBearerAuth()
@Controller()
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get('tournaments/:tournamentId/registrations')
  list(@Param('tournamentId') tournamentId: string) {
    return this.registrationsService.listByTournament(tournamentId);
  }

  @Post('tournaments/:tournamentId/registrations')
  @Roles(UserRole.PLAYER)
  @HttpCode(HttpStatus.CREATED)
  register(
    @Param('tournamentId') tournamentId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterTeamDto,
  ) {
    return this.registrationsService.register(tournamentId, user.userId, dto);
  }

  @Get('registrations/:id')
  findOne(@Param('id') id: string) {
    return this.registrationsService.findById(id);
  }

  @Patch('registrations/:id/review')
  @Roles(UserRole.TO)
  review(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReviewRegistrationDto,
  ) {
    return this.registrationsService.review(id, user.userId, dto);
  }

  @Delete('registrations/:id')
  @Roles(UserRole.PLAYER)
  cancel(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.registrationsService.cancel(id, user.userId);
  }
}
