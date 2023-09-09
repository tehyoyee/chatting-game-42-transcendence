import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";
import { UserStatus } from "./enum/user-status.enum";
import { UserAchievement } from "./enum/user-achievements.enum";

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn()
    user_id: number;
    
    @Column({ default: false })
    two_factor: boolean;
    
    @Column()
    username: string;
    
    @Column()
    nickname: string;

    @Column()
    email: string;

    @Column({ default: UserStatus.OFFLINE })
    status: UserStatus;
    
    @Column({ default: 'default_image' }) 
    avatar: string;
    
    @Column({ default: 0 })
    win_count: number;
    
    @Column({ default: 0 })
    lose_count: number;
    
    @Column({ default: 1000 })
    point: number;

    @Column({ default: UserAchievement.A0 })
    achievement: UserAchievement;

    //친구, 차단, 게임기록, 조인채널목록 추가 필요
}