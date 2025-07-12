import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "src/user/user.entity";


/**
 * GetUser is a custom decorator that extracts the user from the request object.
 * It can be used in route handlers to access the authenticated user.
 */
export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  }
);
