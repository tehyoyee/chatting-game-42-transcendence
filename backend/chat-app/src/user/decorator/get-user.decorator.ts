import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { User } from "../entity/user.entity";

export const getUser = createParamDecorator((data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();

    return req.user;
});