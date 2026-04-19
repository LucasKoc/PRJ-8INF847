import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Search users by username (for adding team members)',
  })
  search(@Query('q') q: string, @Query('limit') limit?: string) {
    const parsed = limit ? Math.min(Number(limit) || 10, 25) : 10;
    return this.users.search(q ?? '', parsed);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID (public fields only)' })
  async findOne(@Param('id') id: string) {
    const user = await this.users.findOneById(id);
    return { id: user.id, username: user.username, role: user.role };
  }
}
