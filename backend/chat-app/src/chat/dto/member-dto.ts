import { User } from "src/user/entity/user.entity";
import { UserType } from "../enum/user_type.enum";

export class MemberDto {
    member: User;

    type: UserType;
    
    is_banned: boolean;
    
    is_muted: boolean;
}