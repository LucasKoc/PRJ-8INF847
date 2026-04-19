import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TournamentFormat } from '../../../common/enums';

export class CreateTournamentDto {
  @ApiProperty({ example: 'Spring Cup 2026', minLength: 3, maxLength: 120 })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'League of Legends', default: 'League of Legends' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  game?: string;

  // --- Gap-analysis Fix #1 ---
  // PRD §6.5: format must be BO1 or BO3 — use enum, not free text.
  @ApiProperty({ enum: TournamentFormat, example: TournamentFormat.BO1 })
  @IsEnum(TournamentFormat, { message: 'format must be either BO1 or BO3' })
  format!: TournamentFormat;

  @ApiProperty({ example: '2026-05-15T23:59:00.000Z' })
  @IsDateString()
  registrationDeadline!: string;

  @ApiProperty({ example: '2026-05-20T19:00:00.000Z' })
  @IsDateString()
  startsAt!: string;

  @ApiPropertyOptional({ example: '2026-05-20T23:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiProperty({ example: 8, minimum: 2, maximum: 64 })
  @IsInt()
  @Min(2)
  @Max(64)
  maxTeams!: number;
}
