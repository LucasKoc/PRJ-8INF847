import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email ou username', example: 'player@dpscheck.test' })
  @IsString()
  @IsNotEmpty()
  identifier!: string;

  @ApiProperty({ example: 'Caliste01!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
