import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterTeamDto {
  @ApiProperty({ example: '42', description: "ID de l'équipe à inscrire" })
  @IsString()
  teamId!: string;
}
