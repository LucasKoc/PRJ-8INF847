import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { LolRole, MemberStatus } from '../common/enums';
import { Team } from './team.entity';
import { User } from './user.entity';

@Entity('team_members')
@Unique('uq_team_member_pair', ['teamId', 'userId'])
export class TeamMember {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'team_id', type: 'bigint' })
  teamId!: string;

  @ManyToOne(() => Team, (team) => team.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.teamMemberships, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'enum', enum: LolRole })
  role!: LolRole;

  @Column({ name: 'is_substitute', type: 'boolean', default: false })
  isSubstitute!: boolean;

  @Column({ type: 'enum', enum: MemberStatus, default: MemberStatus.ACTIVE })
  status!: MemberStatus;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joinedAt!: Date;

  @Column({ name: 'left_at', type: 'timestamptz', nullable: true })
  leftAt?: Date | null;
}
