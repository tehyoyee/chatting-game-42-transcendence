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
exports.MailService = void 0;
const mailer_1 = require("@nestjs-modules/mailer");
const common_1 = require("@nestjs/common");
let MailService = class MailService {
    constructor(mailerService) {
        this.mailerService = mailerService;
    }
    secondAuthentication(clientEmail) {
        const generateRandomString = (len) => {
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
            let randomString = '';
            for (let i = 0; i < len; i++) {
                const rnum = Math.floor(Math.random() * chars.length);
                randomString += chars.substring(rnum, rnum + 1);
            }
            return String(randomString);
        };
        const code = generateRandomString(6);
        this.mailerService
            .sendMail({
            to: `${clientEmail}`,
            from: 'tehyoyee@gmail.com',
            subject: 'Here\'s your verification code',
            text: `Verification Code = ${code}`,
        })
            .then((result) => {
            console.log(result);
        })
            .catch((error) => {
            new common_1.ConflictException(error);
        });
        return code;
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], MailService);
//# sourceMappingURL=mail.service.js.map