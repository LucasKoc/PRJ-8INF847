import {
  LolRole,
  MemberStatus,
  RegistrationStatus,
  TournamentFormat,
  TournamentStatus,
  UserRole,
} from './enums';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

export interface PublicUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface PlayerProfile {
  userId: string;
  summonerName: string;
  tagLine: string;
  region: string;
  mainRole: LolRole | null;
  rank: string | null;
  bio: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user?: PublicUser;
  role: LolRole;
  isSubstitute: boolean;
  status: MemberStatus;
  joinedAt: string;
  leftAt?: string | null;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  captainUserId: string;
  captain?: PublicUser;
  members?: TeamMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Tournament {
  id: string;
  organizerUserId: string;
  organizer?: PublicUser;
  name: string;
  game: string;
  format: TournamentFormat;
  registrationDeadline: string;
  startsAt: string;
  endsAt?: string | null;
  maxTeams: number;
  status: TournamentStatus;
  registrations?: TournamentRegistration[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  teamId: string;
  team?: Team;
  status: RegistrationStatus;
  reviewNote?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

// Backend AllExceptionsFilter envelope
export interface ApiErrorBody {
  statusCode: number;
  error?: string;
  message: string | string[];
  timestamp?: string;
  path?: string;
}
