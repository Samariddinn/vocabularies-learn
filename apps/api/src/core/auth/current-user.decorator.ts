import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "./auth.guard.js";

export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext): JwtPayload => {
        const request = context.switchToHttp().getRequest<Request & { user: JwtPayload }>();
        return request.user;
    },
);