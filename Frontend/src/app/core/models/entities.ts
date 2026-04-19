import {
  LolRole,
  MemberStatus,
  RegistrationStatus,
  TournamentStatus,
  UserRole,
} from './enums';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface PlayerProfile {
  id: string;
  userId: string;
  summonerName: string;
  tagLine: string;
  region: string;
  rank?: string | null;
  mainRole?: LolRole | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: LolRole;
  isSubstitute: boolean;
  status: MemberStatus;
  joinedAt: string;
  leftAt?: string | null;
  user?: User;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  captainUserId: string;
  createdAt: string;
  updatedAt: string;
  captain?: User;
  members?: TeamMember[];
}

export interface Tournament {
  id: string;
  organizerUserId: string;
  name: string;
  game: string;
  format: string;
  registrationDeadline: string;
  startsAt: string;
  endsAt?: string | null;
  maxTeams: number;
  status: TournamentStatus;
  createdAt: string;
  updatedAt: string;
  organizer?: User;
  registrations?: TournamentRegistration[];
}

export interface TournamentRegistration {
  id: string;
  tournamentId: string;
  teamId: string;
  status: RegistrationStatus;
  registeredAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewNote?: string | null;
  team?: Team;
  tournament?: Tournament;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string | string[];
  path?: string;
  timestamp?: string;
}
