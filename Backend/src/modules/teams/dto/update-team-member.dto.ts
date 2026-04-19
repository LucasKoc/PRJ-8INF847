import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { LolRole } from '../../../common/enums';

export class UpdateTeamMemberDto {
  @ApiPropertyOptional({ enum: LolRole })
  @IsOptional()
  @IsEnum(LolRole)
  role?: LolRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSubstitute?: boolean;
}
