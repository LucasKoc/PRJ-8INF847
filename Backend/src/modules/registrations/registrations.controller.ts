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
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { RegistrationsService } from './registrations.service';
import { ReviewRegistrationDto } from './dto/review-registration.dto';

@ApiTags('registrations')
@Controller()
export class RegistrationsController {
  constructor(private readonly regs: RegistrationsService) {}

  @Public()
  @Get('tournaments/:tournamentId/registrations')
  @ApiOperation({ summary: 'List all registrations for a tournament (public)' })
  list(@Param('tournamentId') tournamentId: string) {
    return this.regs.listForTournament(tournamentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLAYER)
  @ApiBearerAuth()
  @Post('tournaments/:tournamentId/registrations/:teamId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a team for a tournament (captain only)' })
  register(
    @Param('tournamentId') tournamentId: string,
    @Param('teamId') teamId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.regs.register(tournamentId, teamId, user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TO)
  @ApiBearerAuth()
  @Patch('registrations/:id/review')
  @ApiOperation({ summary: 'Approve or reject a PENDING registration (organizing TO only)' })
  review(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReviewRegistrationDto,
  ) {
    return this.regs.review(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLAYER)
  @ApiBearerAuth()
  @Patch('registrations/:id/cancel')
  @ApiOperation({ summary: 'Cancel a PENDING or APPROVED registration (captain only)' })
  cancel(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.regs.cancel(id, user.sub);
  }
}
