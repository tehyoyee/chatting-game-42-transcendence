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
exports.JoinGroupChannelDto = exports.DmChannelDto = exports.GroupChannelDto = void 0;
const class_validator_1 = require("class-validator");
const channel_type_enum_1 = require("../enum/channel_type.enum");
class GroupChannelDto {
}
exports.GroupChannelDto = GroupChannelDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], GroupChannelDto.prototype, "channelName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(channel_type_enum_1.ChannelType),
    __metadata("design:type", String)
], GroupChannelDto.prototype, "channelType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GroupChannelDto.prototype, "password", void 0);
class DmChannelDto {
}
exports.DmChannelDto = DmChannelDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], DmChannelDto.prototype, "receiverId", void 0);
class JoinGroupChannelDto {
}
exports.JoinGroupChannelDto = JoinGroupChannelDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], JoinGroupChannelDto.prototype, "channelId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], JoinGroupChannelDto.prototype, "password", void 0);
//# sourceMappingURL=channel-dto.js.map