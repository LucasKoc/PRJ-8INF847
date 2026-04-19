import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RegistrationStatus } from '../common/enums';
import { Tournament } from './tournament.entity';
import { Team } from './team.entity';
import { User } from './user.entity';

@Entity('tournament_registrations')
export class TournamentRegistration {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'tournament_id', type: 'bigint' })
  tournamentId!: string;

  @ManyToOne(() => Tournament, t => t.registrations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tournament_id' })
  tournament?: Tournament;

  @Column({ name: 'team_id', type: 'bigint' })
  teamId!: string;

  @ManyToOne(() => Team, team => team.registrations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team?: Team;

  @Column({ type: 'enum', enum: RegistrationStatus, default: RegistrationStatus.PENDING })
  status!: RegistrationStatus;

  @Column({ name: 'review_note', type: 'text', nullable: true })
  reviewNote?: string | null;

  @Column({ name: 'reviewed_by_user_id', type: 'bigint', nullable: true })
  reviewedByUserId?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_user_id' })
  reviewedBy?: User | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
