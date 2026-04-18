import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../common/enums';

export class RegisterDto {
  @ApiProperty({ example: 'player@dpscheck.test' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'KC_NEXT_ADKING', minLength: 3, maxLength: 50 })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'username doit contenir uniquement des lettres, chiffres, _ ou -',
  })
  username!: string;

  @ApiProperty({ example: 'Caliste01!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PLAYER })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}
