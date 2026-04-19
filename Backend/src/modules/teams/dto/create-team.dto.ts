import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Phoenix Rising', minLength: 3, maxLength: 80 })
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 'PHX', minLength: 2, maxLength: 3 })
  @IsString()
  @Matches(/^[A-Za-z0-9]{2,3}$/, {
    message: 'Tag must be 2 or 3 alphanumeric characters',
  })
  tag!: string;
}
