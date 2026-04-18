export declare class CreateTournamentDto {
    name: string;
    game?: string;
    format: string;
    registrationDeadline: Date;
    startsAt: Date;
    endsAt?: Date;
    maxTeams: number;
}
