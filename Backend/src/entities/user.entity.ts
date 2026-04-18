import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../common/enums';
import { PlayerProfile } from './player-profile.entity';
import { Team } from './team.entity';
import { TeamMember } from './team-member.entity';
import { Tournament } from './tournament.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => PlayerProfile, (profile) => profile.user)
  playerProfile?: PlayerProfile;

  @OneToMany(() => Team, (team) => team.captain)
  captainOfTeams?: Team[];

  @OneToMany(() => TeamMember, (member) => member.user)
  teamMemberships?: TeamMember[];

  @OneToMany(() => Tournament, (tournament) => tournament.organizer)
  organizedTournaments?: Tournament[];
}
