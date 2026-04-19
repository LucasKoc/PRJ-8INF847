import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateTournamentDto {
  @ApiProperty({ example: 'UQAR Summer Cup 2026', minLength: 3, maxLength: 120 })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: 'League of Legends',
    default: 'League of Legends',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  game?: string;

  @ApiProperty({ example: 'Single Elimination BO1', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  format!: string;

  @ApiProperty({ example: '2026-05-15T00:00:00Z' })
  @Type(() => Date)
  @IsDate()
  registrationDeadline!: Date;

  @ApiProperty({ example: '2026-05-20T18:00:00Z' })
  @Type(() => Date)
  @IsDate()
  startsAt!: Date;

  @ApiPropertyOptional({ example: '2026-05-22T23:00:00Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endsAt?: Date;

  @ApiProperty({ example: 16, minimum: 2 })
  @IsInt()
  @Min(2)
  maxTeams!: number;
}
