import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'alice_mid', description: 'Username or email' })
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  identifier!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
