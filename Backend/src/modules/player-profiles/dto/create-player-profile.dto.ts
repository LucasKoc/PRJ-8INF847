import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { LolRole } from '../../../common/enums';

export class CreatePlayerProfileDto {
  @ApiProperty({ example: 'Caliste', minLength: 3, maxLength: 50 })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  summonerName!: string;

  @ApiProperty({ example: 'EUW', minLength: 2, maxLength: 10 })
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  @Matches(/^[A-Za-z0-9]+$/, {
    message: 'tagLine : lettres et chiffres uniquement',
  })
  tagLine!: string;

  @ApiProperty({ example: 'EUW1', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  region!: string;

  @ApiPropertyOptional({ example: 'Diamond II' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  rank?: string;

  @ApiPropertyOptional({ enum: LolRole })
  @IsOptional()
  @IsEnum(LolRole)
  mainRole?: LolRole;

  @ApiPropertyOptional({ example: 'Main ADC depuis S9.' })
  @IsOptional()
  @IsString()
  bio?: string;
}
