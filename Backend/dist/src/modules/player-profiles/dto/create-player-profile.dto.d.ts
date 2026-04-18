import { LolRole } from '../../../common/enums';
export declare class CreatePlayerProfileDto {
    summonerName: string;
    tagLine: string;
    region: string;
    rank?: string;
    mainRole?: LolRole;
    bio?: string;
}
