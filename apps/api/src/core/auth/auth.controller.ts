import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { RegisterDto } from './dto/auth.dto.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly _authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this._authService.register(dto);
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() dto: LoginDto) {
        return this._authService.login(dto);
    }
}
