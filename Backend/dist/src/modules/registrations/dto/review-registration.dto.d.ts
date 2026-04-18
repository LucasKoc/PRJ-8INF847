import { RegistrationStatus } from '../../../common/enums';
export declare class ReviewRegistrationDto {
    status: RegistrationStatus.APPROVED | RegistrationStatus.REJECTED;
    reviewNote?: string;
}
