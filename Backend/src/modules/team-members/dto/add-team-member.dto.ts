import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { LolRole } from '../../../common/enums';

export class AddTeamMemberDto {
  @ApiProperty({ example: '42', description: 'ID du joueur à ajouter' })
  @IsString()
  userId!: string;

  @ApiProperty({ enum: LolRole, example: LolRole.MID })
  @IsEnum(LolRole)
  role!: LolRole;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSubstitute?: boolean;
}
