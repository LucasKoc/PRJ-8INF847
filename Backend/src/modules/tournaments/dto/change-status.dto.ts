import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TournamentStatus } from '../../../common/enums';

export class ChangeStatusDto {
  @ApiProperty({ enum: TournamentStatus })
  @IsEnum(TournamentStatus)
  status!: TournamentStatus;
}
