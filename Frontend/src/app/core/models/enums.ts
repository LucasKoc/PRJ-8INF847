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

export enum TournamentFormat {
  BO1 = 'BO1',
  BO3 = 'BO3',
}

// Display helpers
export const LOL_ROLE_LABEL: Record<LolRole, string> = {
  [LolRole.TOP]: 'Top',
  [LolRole.JUNGLE]: 'Jungle',
  [LolRole.MID]: 'Mid',
  [LolRole.ADC]: 'ADC',
  [LolRole.SUPPORT]: 'Support',
  [LolRole.FLEX]: 'Flex',
};

export const STATUS_LABEL_FR: Record<TournamentStatus, string> = {
  [TournamentStatus.DRAFT]: 'Brouillon',
  [TournamentStatus.OPEN]: 'Ouvert',
  [TournamentStatus.CLOSED]: 'Fermé',
  [TournamentStatus.CANCELLED]: 'Annulé',
  [TournamentStatus.COMPLETED]: 'Terminé',
};

export const REG_STATUS_LABEL_FR: Record<RegistrationStatus, string> = {
  [RegistrationStatus.PENDING]: 'En attente',
  [RegistrationStatus.APPROVED]: 'Approuvée',
  [RegistrationStatus.REJECTED]: 'Rejetée',
  [RegistrationStatus.CANCELLED]: 'Annulée',
};
