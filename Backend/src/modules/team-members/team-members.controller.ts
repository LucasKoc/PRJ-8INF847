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
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMembersService } from './team-members.service';

@ApiTags('team-members')
@ApiBearerAuth()
@Controller('teams/:teamId/members')
export class TeamMembersController {
  constructor(private readonly membersService: TeamMembersService) {}

  @Get()
  list(@Param('teamId') teamId: string) {
    return this.membersService.listByTeam(teamId);
  }

  @Post()
  @Roles(UserRole.PLAYER)
  @HttpCode(HttpStatus.CREATED)
  add(
    @Param('teamId') teamId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddTeamMemberDto,
  ) {
    return this.membersService.add(teamId, user.userId, dto);
  }

  @Patch(':memberId')
  @Roles(UserRole.PLAYER)
  update(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.membersService.update(teamId, memberId, user.userId, dto);
  }

  @Delete(':memberId')
  @Roles(UserRole.PLAYER)
  remove(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.membersService.remove(teamId, memberId, user.userId);
  }
}
