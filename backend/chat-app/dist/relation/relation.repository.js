"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationRepository = void 0;
const common_1 = require("@nestjs/common");
const relation_entity_1 = require("./entity/relation.entity");
const typeorm_1 = require("typeorm");
let RelationRepository = class RelationRepository extends typeorm_1.Repository {
    constructor(datasource) {
        super(relation_entity_1.Relation, datasource.createEntityManager());
    }
    async addRelation(sender, receiverId, newRelationType) {
        const newRelation = new relation_entity_1.Relation();
        newRelation.relation_type = newRelationType;
        newRelation.sender_id = sender.user_id;
        newRelation.receiver_id = receiverId;
        newRelation.sender = sender;
        await newRelation.save();
        return newRelation;
    }
    async deleteRelation(relationId) {
        await this.delete({ relation_id: relationId });
    }
    async getRelationByIds(senderId, receiverId) {
        const found = await this.findOne({
            where: { sender_id: senderId,
                receiver_id: receiverId }
        });
        return found;
    }
};
exports.RelationRepository = RelationRepository;
exports.RelationRepository = RelationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], RelationRepository);
//# sourceMappingURL=relation.repository.js.map