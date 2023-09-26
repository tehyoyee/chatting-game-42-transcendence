"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const user_controller_1 = require("./user.controller");
const user_service_1 = require("./user.service");
const user_repository_1 = require("./user.repository");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entity/user.entity");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const config = require("config");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("@nestjs/config");
const multer_1 = require("multer");
const fs = require("fs");
const path_1 = require("path");
const light_date_1 = require("light-date");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (config) => ({
                    storage: (0, multer_1.diskStorage)({
                        destination: function (req, file, cb) {
                            const dest = __dirname + `/../../uploads/${(0, light_date_1.format)(new Date(), '{yyyy}{MM}')}/`;
                            if (!fs.existsSync(dest)) {
                                fs.mkdirSync(dest, { recursive: true });
                            }
                            cb(null, dest);
                        },
                        filename: (req, file, cb) => {
                            const randomName = Array(32)
                                .fill(null)
                                .map(() => Math.round(Math.random() * 16).toString(16))
                                .join('');
                            return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
                        },
                    }),
                }),
                inject: [config_1.ConfigService],
            }),
            passport_1.PassportModule.register({
                defaultStrategy: 'jwt'
            }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || config.get('jwt.secret'),
                signOptions: {
                    expiresIn: '60m',
                }
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User])
        ],
        controllers: [user_controller_1.UserController],
        providers: [user_service_1.UserService, user_repository_1.UserRepository, config_1.ConfigService],
        exports: [typeorm_1.TypeOrmModule, user_repository_1.UserRepository],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map