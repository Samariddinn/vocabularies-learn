import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/auth.dto.js';
import { UsersService } from '../../modules/users/users.service.js';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly _usersService: UsersService, private readonly _jwtService: JwtService) { }

    async register(dto: RegisterDto) {
        const login = dto.login.trim().toLowerCase();

        const existingLogin = await this._usersService.findByLogin(login);
        if (existingLogin) {
            throw new ConflictException('Login already taken');
        }

        const passwordHash = await argon2.hash(dto.password);

        return this._usersService.create(login, passwordHash);
    }

    async login(dto: LoginDto) {
        const login = dto.login.trim().toLowerCase();

        const user = await this._usersService.findByLogin(login);

        const isPasswordMatch = user ? await argon2.verify(user.password_hash, dto.password) : false

        if (!user || !isPasswordMatch) {
            throw new UnauthorizedException('Login or Password is incorrect')
        }

        const accessToken = await this._jwtService.signAsync({
            sub: user.id,
            login: user.login,
            role: user.role
        })

        return { accessToken }
    }
}

