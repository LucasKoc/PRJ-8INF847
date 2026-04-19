import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { LolRole } from '../../../common/enums';

export class CreatePlayerProfileDto {
  @ApiProperty({ example: 'AliceMid', minLength: 3, maxLength: 50 })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  summonerName!: string;

  @ApiProperty({ example: 'EUW', minLength: 2, maxLength: 10 })
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  @Matches(/^[A-Za-z0-9]+$/, { message: 'Tag line must be alphanumeric' })
  tagLine!: string;

  @ApiProperty({ example: 'EUW1', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  region!: string;

  @ApiPropertyOptional({ enum: LolRole, example: LolRole.MID })
  @IsOptional()
  @IsEnum(LolRole)
  mainRole?: LolRole;

  @ApiPropertyOptional({ example: 'Diamond II' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rank?: string;

  @ApiPropertyOptional({ example: 'Midlane main, assassin enjoyer.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
