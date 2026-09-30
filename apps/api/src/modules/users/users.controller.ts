import { Controller, Get, NotFoundException, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, JwtPayload } from '../../core/auth/auth.guard.js';
import { Request } from 'express';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
    constructor(private readonly _usersService: UsersService) { }

    @Get('me')
    @UseGuards(AuthGuard)
    async getMe(@Req() request: Request & { user: JwtPayload }) {
        const user = await this._usersService.findById(request.user.sub);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
}
