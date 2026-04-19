import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RegistrationStatus } from '../../../common/enums';

export class ReviewRegistrationDto {
  @ApiProperty({
    enum: [RegistrationStatus.APPROVED, RegistrationStatus.REJECTED],
    example: RegistrationStatus.APPROVED,
  })
  @IsEnum(RegistrationStatus)
  status!: RegistrationStatus.APPROVED | RegistrationStatus.REJECTED;

  @ApiPropertyOptional({ example: 'Team roster does not meet minimum starters' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewNote?: string;
}
