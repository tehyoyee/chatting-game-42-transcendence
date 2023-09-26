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
exports.Relation = void 0;
const user_entity_1 = require("../../user/entity/user.entity");
const typeorm_1 = require("typeorm");
const relation_type_enum_1 = require("../enum/relation-type.enum");
let Relation = class Relation extends typeorm_1.BaseEntity {
};
exports.Relation = Relation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Relation.prototype, "relation_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Relation.prototype, "relation_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_id' }),
    __metadata("design:type", Number)
], Relation.prototype, "sender_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Relation.prototype, "receiver_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(typa => user_entity_1.User, sender => sender.senders),
    (0, typeorm_1.JoinColumn)({ name: 'sender_id' }),
    __metadata("design:type", user_entity_1.User)
], Relation.prototype, "sender", void 0);
exports.Relation = Relation = __decorate([
    (0, typeorm_1.Entity)()
], Relation);
//# sourceMappingURL=relation.entity.js.map