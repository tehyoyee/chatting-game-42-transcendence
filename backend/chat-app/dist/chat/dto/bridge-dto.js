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
exports.BridgeDto = void 0;
const class_validator_1 = require("class-validator");
const user_type_enum_1 = require("../enum/user_type.enum");
const user_status_enum_1 = require("../../user/enum/user-status.enum");
class BridgeDto {
}
exports.BridgeDto = BridgeDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], BridgeDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BridgeDto.prototype, "userNickName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(user_type_enum_1.UserType),
    __metadata("design:type", String)
], BridgeDto.prototype, "userType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(user_status_enum_1.UserStatus),
    __metadata("design:type", String)
], BridgeDto.prototype, "userStatus", void 0);
//# sourceMappingURL=bridge-dto.js.map