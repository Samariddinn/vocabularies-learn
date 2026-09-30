import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

export interface JwtPayload {
    sub: string;
    login: string;
    role: 'user' | 'admin';
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly _jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>()

        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        if (type !== 'Bearer' || !token) throw new UnauthorizedException();

        try {
            request.user = await this._jwtService.verifyAsync<JwtPayload>(token)
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }
}