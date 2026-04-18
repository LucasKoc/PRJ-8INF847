import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { RegistrationStatus } from '../../../common/enums';

export class ReviewRegistrationDto {
  @ApiProperty({
    enum: [RegistrationStatus.APPROVED, RegistrationStatus.REJECTED],
  })
  @IsEnum(RegistrationStatus)
  @IsIn([RegistrationStatus.APPROVED, RegistrationStatus.REJECTED])
  status!: RegistrationStatus.APPROVED | RegistrationStatus.REJECTED;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewNote?: string;
}
