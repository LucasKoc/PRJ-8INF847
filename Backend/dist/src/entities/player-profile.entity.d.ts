import { LolRole } from '../common/enums';
import { User } from './user.entity';
export declare class PlayerProfile {
    id: string;
    userId: string;
    user: User;
    summonerName: string;
    tagLine: string;
    region: string;
    rank?: string | null;
    mainRole?: LolRole | null;
    bio?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
