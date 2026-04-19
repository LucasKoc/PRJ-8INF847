import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

export interface PublicUser {
  id: string;
  username: string;
  role: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async findOneById(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async search(query: string, limit = 10): Promise<PublicUser[]> {
    const q = (query ?? '').trim();
    if (q.length < 2) return [];
    const rows = await this.users
      .createQueryBuilder('u')
      .where('u.username ILIKE :q', { q: `%${q}%` })
      .orderBy('u.username', 'ASC')
      .limit(Math.min(Math.max(limit, 1), 25))
      .getMany();
    return rows.map(u => ({ id: u.id, username: u.username, role: u.role }));
  }
}
