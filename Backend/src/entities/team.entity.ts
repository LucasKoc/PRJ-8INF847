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
import { User } from './user.entity';
import { TeamMember } from './team-member.entity';
import { TournamentRegistration } from './tournament-registration.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ type: 'varchar', length: 80, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 3, unique: true })
  tag!: string;

  @Column({ name: 'captain_user_id', type: 'bigint' })
  captainUserId!: string;

  @ManyToOne(() => User, user => user.captainOfTeams, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'captain_user_id' })
  captain!: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => TeamMember, member => member.team)
  members?: TeamMember[];

  @OneToMany(() => TournamentRegistration, reg => reg.team)
  registrations?: TournamentRegistration[];
}
