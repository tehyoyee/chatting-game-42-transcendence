import { Request } from "express";
import { User } from "src/user/entity/user.entity";
export interface UserInRequest extends Request {
    user: User;
}
