import { UserStatus } from "src/user/enum/user-status.enum";
export declare class SocialDto {
    userId: number;
    userNickName: string;
    isFriend: boolean;
    isBlocked: boolean;
    userStatus: UserStatus;
}
