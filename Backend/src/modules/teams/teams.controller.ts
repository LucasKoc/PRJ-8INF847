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
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teams: TeamsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all teams (public)' })
  findAll() {
    return this.teams.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a team with its ACTIVE roster (public)' })
  findOne(@Param('id') id: string) {
    return this.teams.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PLAYER)
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a team — caller becomes captain (PLAYER only)' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTeamDto) {
    return this.teams.create(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a team (captain only)' })
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() dto: UpdateTeamDto) {
    return this.teams.update(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a team (captain only)' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.teams.remove(id, user.sub);
  }

  // ---------------- Members ----------------

  @Public()
  @Get(':id/members')
  @ApiOperation({ summary: 'List ACTIVE members of a team (public)' })
  listMembers(@Param('id') id: string) {
    return this.teams.listMembers(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a member by user ID (captain only)' })
  addMember(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddTeamMemberDto,
  ) {
    return this.teams.addMember(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/members/:memberId')
  @ApiOperation({ summary: 'Update a member (captain only)' })
  updateMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.teams.updateMember(id, memberId, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from the team (captain only)' })
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.teams.removeMember(id, memberId, user.sub);
  }
}
