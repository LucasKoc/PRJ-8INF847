import { LolRole } from '../../../common/enums';
export declare class AddTeamMemberDto {
    userId: string;
    role: LolRole;
    isSubstitute?: boolean;
}
