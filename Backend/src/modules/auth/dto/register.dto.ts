import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../../common/enums';

export class RegisterDto {
  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'alice_mid', minLength: 3, maxLength: 50 })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'Username may only contain letters, numbers, _ and -',
  })
  username!: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(72, { message: 'Password must be at most 72 characters long' })
  password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PLAYER })
  @IsEnum(UserRole, { message: 'Role must be PLAYER or TO' })
  role!: UserRole;
}
