import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { RegistrationStatus } from '../common/enums';
import { Tournament } from './tournament.entity';
import { Team } from './team.entity';
import { User } from './user.entity';

@Entity('tournament_registrations')
@Unique('uq_tournament_team', ['tournamentId', 'teamId'])
export class TournamentRegistration {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'tournament_id', type: 'bigint' })
  tournamentId!: string;

  @ManyToOne(() => Tournament, tournament => tournament.registrations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tournament_id' })
  tournament!: Tournament;

  @Column({ name: 'team_id', type: 'bigint' })
  teamId!: string;

  @ManyToOne(() => Team, team => team.registrations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status!: RegistrationStatus;

  @CreateDateColumn({ name: 'registered_at', type: 'timestamptz' })
  registeredAt!: Date;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt?: Date | null;

  @Column({ name: 'reviewed_by', type: 'bigint', nullable: true })
  reviewedBy?: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: User | null;

  @Column({ name: 'review_note', type: 'text', nullable: true })
  reviewNote?: string | null;
}
