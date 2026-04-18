import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Phoenix Rising', minLength: 3, maxLength: 80 })
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name!: string;

  @ApiProperty({
    example: 'PHX',
    description: '2 à 3 caractères alphanumériques',
    minLength: 2,
    maxLength: 3,
  })
  @IsString()
  @Matches(/^[A-Za-z0-9]{2,3}$/, {
    message: 'tag : 2 à 3 caractères alphanumériques uniquement',
  })
  tag!: string;
}
