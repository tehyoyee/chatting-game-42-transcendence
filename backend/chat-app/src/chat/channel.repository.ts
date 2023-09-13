import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Channel } from "./entity/channel.entity";
import { User } from "src/user/entity/user.entity";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { UserType } from "./enum/user_type.enum";

@Injectable()
export class ChannelRepository extends Repository<Channel> {
    constructor(dataSource: DataSource) {
        super(Channel, dataSource.createEntityManager())
    }

    async createChannel(user: User, createChannelDto: CreateChannelDto): Promise<Channel> {
        const {name, type, password} = createChannelDto;

        const foundDuplicate = this.getChannelByName(name);
        if (!foundDuplicate)
            throw new NotFoundException(`${name} 채널이 이미 존재합니다.`);
        
        const newChannel = await this.create({
            channel_name: name,
            channel_type: type,
            channel_pwd: password
        });
        //아래는 자동으로 넣어야 하는지 수동인지 확인
        newChannel.details.user = user;
        newChannel.details.user_id = user.user_id;
        newChannel.details.user_type = UserType.OWNER;
        newChannel.details.channel_id = newChannel.channel_id;

        await this.save(newChannel);
        
        return newChannel;
    }

    async getChannelByName(name: string): Promise<Channel> {
        return 
    }

    async getChannelById(id: number): Promise<Channel> {
        return 
    }

}