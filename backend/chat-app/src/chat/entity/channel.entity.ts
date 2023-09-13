import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChannelType} from "../enum/channel_type.enum";
import { Message } from "./message.entity";
import { UserChannelBridge } from "./user-channel-bridge.entity";

@Entity()
export class Channel extends BaseEntity {
    @PrimaryGeneratedColumn()
    channel_id: number;

    @Column()
    channel_name: string;

    @Column({ default: ChannelType.PUBLIC })
    channel_type: ChannelType;

    @Column({ nullable: true })
    channel_pwd: string;

    //아래는 관계 표현
    @OneToMany(type => UserChannelBridge, details => details.channel, { eager: false })
    details: UserChannelBridge;

    @OneToMany(type => Message, messages => messages.channel, { eager: false })
    messages: Message[];
}

/*
1. 채널의 소유자/관리자 문제
- 하나의 채널은 반드시 하나의 소유자, 하나의 소유자는 다수의 채널 소유 가능
- one to many, many to one
- user 엔터티에서 소유채널목록 칼럼을 둬야 할까? 그렇다면 관리채널목록도 따로 둬야 하나?
- 하나의 채널은 다수의 관리자, 하나의 관리자는 다수의 채널 관리 가능 => 1.2

1.2. 채널과 유저와의 관계 문제
- 하나의 채널은 다수의 유저가 참가할 수 있고, 하나의 유저는 다수의 채널에 참가할 수 있다.
- 다대다 관계는 각 엔터티의 기본키를 외래키로 가져와서 관계테이블을 별도로 구성해야 한다
- 채널과 유저의 관계테이블을 만들어서, 채널id, 유저id, 소유자/관리자/참가자, 밴, 뮤트 있어야 할듯
- 3 | 93240 | OWNER | false | false
- 3 | 93242 | PART | false | true
- 2 | 93240 | PART | false | true

2. 메세지 문제
- 메세지 기록이 db에 저장되어야 한다.
- 하나의 메세지는 하나의 채널, 하나의 채널은 다수의 메세지 가질 수 있음
- 채널에 메세지[] 칼럼(보이지는 않게), 메세지에 채널 칼럼 있어야 함

- 하나의 메세지는 하나의 유저, 하나의 유저는 다수의 메세지 가질 수 있음
- 유저에 메세지[] 칼럼(보이지는 않게), 메세지에 유저 칼럼 있어야 함
*/