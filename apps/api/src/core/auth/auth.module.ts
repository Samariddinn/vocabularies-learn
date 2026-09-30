import { Module } from '@nestjs/common';
import { UsersModule } from '../../modules/users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';

@Module({
    imports: [UsersModule,
        JwtModule.registerAsync({
            global: true,
            useFactory: () => ({
                secret: process.env.JWT_ACCESS_SECRET,
                signOptions: { // env values are plain strings; jsonwebtoken expects a duration like '15m' or '1d'
                    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as JwtSignOptions['expiresIn'],
                }
            })
        })
    ],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule { }
