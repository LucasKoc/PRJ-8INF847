export enum UserRole {
  PLAYER = 'PLAYER',
  TO = 'TO',
}

export enum LolRole {
  TOP = 'TOP',
  JUNGLE = 'JUNGLE',
  MID = 'MID',
  ADC = 'ADC',
  SUPPORT = 'SUPPORT',
  FLEX = 'FLEX',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  LEFT = 'LEFT',
  REMOVED = 'REMOVED',
}

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}
