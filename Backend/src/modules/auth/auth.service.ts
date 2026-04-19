import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

const BCRYPT_COST = 10;

export interface AuthResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    // Unique-by-email and unique-by-username pre-check for cleaner errors
    const existing = await this.users.findOne({
      where: [{ email: dto.email.toLowerCase() }, { username: dto.username }],
    });
    if (existing) {
      if (existing.email === dto.email.toLowerCase()) {
        throw new ConflictException('An account with this email already exists');
      }
      throw new ConflictException('This username is already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
    const user = this.users.create({
      email: dto.email.toLowerCase(),
      username: dto.username,
      passwordHash,
      role: dto.role,
    });
    const saved = await this.users.save(user);
    return this.buildResult(saved);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const identifier = dto.identifier.trim();
    const user = await this.users.findOne({
      where: [{ email: identifier.toLowerCase() }, { username: identifier }],
    });
    // Generic error to avoid user enumeration
    const genericError = new UnauthorizedException('Invalid credentials');
    if (!user) throw genericError;

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) throw genericError;

    return this.buildResult(user);
  }

  private buildResult(user: User): AuthResult {
    const payload: JwtPayload = {
      sub: Number(user.id),
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }
}
