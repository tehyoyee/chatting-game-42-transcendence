import { UserType } from "../enum/user_type.enum";
import { UserStatus } from "src/user/enum/user-status.enum";
export declare class BridgeDto {
    userId: number;
    userNickName: string;
    userType: UserType;
    isMuted: boolean;
    isFriend: boolean;
    isBlocked: boolean;
    userStatus: UserStatus;
}
