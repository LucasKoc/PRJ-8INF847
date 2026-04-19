import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { LolRole } from '../common/enums';
import { User } from './user.entity';

@Entity('player_profiles')
@Unique('uq_player_profile_identity', ['summonerName', 'tagLine', 'region'])
export class PlayerProfile {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unique: true })
  userId!: string;

  @OneToOne(() => User, user => user.playerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'summoner_name', type: 'varchar', length: 50 })
  summonerName!: string;

  @Column({ name: 'tag_line', type: 'varchar', length: 10 })
  tagLine!: string;

  @Column({ type: 'varchar', length: 20 })
  region!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  rank?: string | null;

  @Column({ name: 'main_role', type: 'enum', enum: LolRole, nullable: true })
  mainRole?: LolRole | null;

  @Column({ type: 'text', nullable: true })
  bio?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
