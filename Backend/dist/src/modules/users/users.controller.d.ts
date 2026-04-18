import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(current: AuthenticatedUser): Promise<{
        id: string;
        email: string;
        username: string;
        role: import("../../common/enums").UserRole;
        isActive: boolean;
        createdAt: Date;
    }>;
    findAll(): Promise<import("../../entities/user.entity").User[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        username: string;
        role: import("../../common/enums").UserRole;
        isActive: boolean;
        createdAt: Date;
    }>;
}
