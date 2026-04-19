import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TournamentFormat, TournamentStatus } from '../common/enums';
import { User } from './user.entity';
import { TournamentRegistration } from './tournament-registration.entity';

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'organizer_user_id', type: 'bigint' })
  organizerUserId!: string;

  @ManyToOne(() => User, user => user.organizedTournaments)
  @JoinColumn({ name: 'organizer_user_id' })
  organizer?: User;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 50, default: 'League of Legends' })
  game!: string;

  @Column({ type: 'varchar', length: 10 })
  format!: TournamentFormat;

  @Column({ name: 'registration_deadline', type: 'timestamptz' })
  registrationDeadline!: Date;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamptz', nullable: true })
  endsAt?: Date | null;

  @Column({ name: 'max_teams', type: 'int' })
  maxTeams!: number;

  @Column({ type: 'enum', enum: TournamentStatus, default: TournamentStatus.DRAFT })
  status!: TournamentStatus;

  @OneToMany(() => TournamentRegistration, reg => reg.tournament)
  registrations?: TournamentRegistration[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
