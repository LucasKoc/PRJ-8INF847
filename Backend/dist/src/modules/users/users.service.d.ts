import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
export declare class UsersService {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    findById(id: string): Promise<User>;
    findAll(): Promise<User[]>;
    toPublic(user: User): Promise<{
        id: string;
        email: string;
        username: string;
        role: import("../../common/enums").UserRole;
        isActive: boolean;
        createdAt: Date;
    }>;
}
