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
exports.AuthService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const rxjs_1 = require("rxjs");
const config = require("config");
const mail_service_1 = require("./mail.service");
const user_status_enum_1 = require("../user/enum/user-status.enum");
const dbconfig = config.get('intra');
const grant_type = dbconfig.get('grant_type');
const client_id = dbconfig.get('client_id');
const client_secret = dbconfig.get('client_secret');
const redirect_uri = dbconfig.get('redirect_uri');
let AuthService = class AuthService {
    constructor(userService, jwtService, httpService, mailService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.httpService = httpService;
        this.mailService = mailService;
    }
    async signUp(code, res) {
        const generateRandomString = async (len) => {
            const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
            let randomString = '';
            for (let i = 0; i < len; i++) {
                const rnum = Math.floor(Math.random() * chars.length);
                randomString += chars.substring(rnum, rnum + 1);
            }
            const checkDuplicate = await this.userService.getProfileByNickName(randomString);
            if (checkDuplicate) {
                return generateRandomString(len);
            }
            return randomString;
        };
        const accessToken = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`https://api.intra.42.fr/oauth/token?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&code=${code}&redirect_uri=${redirect_uri}`).pipe());
        const axiosConfig = {
            headers: {
                Authorization: `Bearer ${accessToken.data.access_token}`
            },
            withCredentials: true,
        };
        const user = await (0, rxjs_1.firstValueFrom)(this.httpService.get('https://api.intra.42.fr/v2/me', axiosConfig).pipe());
        const duplicateTest = await this.userService.getProfileByUserId(user.data.id);
        if (duplicateTest) {
            if (duplicateTest.status !== user_status_enum_1.UserStatus.OFFLINE) {
                throw new common_1.HttpException('User already logged in this site.', common_1.HttpStatus.UNAUTHORIZED);
            }
        }
        const payload = { username: user.data.login, id: user.data.id };
        const newAccessToken = this.jwtService.sign({ payload });
        const found = await this.userService.getProfileByUserId(user.data.id);
        if (found) {
            const two_factor = await this.userService.getTwoFactorByUserId(payload.id);
            if (two_factor) {
                const clientEmail = await this.userService.getEmailByUserId(payload.id);
                const verificationCode = this.mailService.secondAuthentication(clientEmail);
                this.userService.updateTwoFactorCode(payload.id, verificationCode);
                res.send({
                    id: payload.id,
                    firstLogin: false,
                    two_factor: true
                });
            }
            else {
                res.cookie('token', newAccessToken, { maxAge: 60 * 60 * 1000, httpOnly: false, sameSite: 'lax' });
                res.send({
                    id: payload.id,
                    firstLogin: false,
                    two_factor: false
                });
            }
            return;
        }
        const createUserDto = {
            user_id: user.data.id,
            username: user.data.login,
            nickname: await generateRandomString(12),
            email: user.data.email,
            avatar: __dirname + '/../../uploads/default.png',
        };
        this.userService.createUser(createUserDto);
        res.cookie('token', newAccessToken, { maxAge: 60 * 60 * 1000, httpOnly: false, sameSite: 'lax' });
        res.send({
            id: createUserDto.user_id,
            firstLogin: true,
            two_factor: false
        });
        return;
    }
    async checkLoginState(req, res) {
        const token = req.cookies['token'];
        try {
            const { payload } = this.jwtService.verify(token);
        }
        catch (err) {
            throw new common_1.HttpException('[Login State] Unauthorized Token', common_1.HttpStatus.UNAUTHORIZED);
        }
        const { payload } = this.jwtService.verify(token);
        const found = await this.userService.getProfileByUserId(payload.id);
        if (!found) {
            throw new common_1.HttpException('Unregistered User', common_1.HttpStatus.UNAUTHORIZED);
        }
        const newToken = this.jwtService.sign({ payload });
        res.cookie('token', newToken, {
            httpOnly: false,
            maxAge: 60 * 60 * 1000,
            sameSite: 'lax',
        });
        res.json({ loggedIn: true, user: payload });
        return;
    }
    async signOut(req, res) {
        const token = req.cookies['token'];
        const payload = await this.verifyToken(token);
        const user = await this.userService.getProfileByUserId(payload.user_id);
        this.userService.updateStatus(user.user_id, user_status_enum_1.UserStatus.OFFLINE);
        res.clearCookie('token').json({ status: 200, message: "Signned Out" });
    }
    async verifyToken(token) {
        try {
            const { payload } = await this.jwtService.verify(token);
            if (payload)
                return payload;
            throw new common_1.HttpException('test error Token', common_1.HttpStatus.UNAUTHORIZED);
        }
        catch (error) {
            throw new common_1.HttpException(`Invalid Token: ${error}`, common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async verifyTokenSocket(token) {
        try {
            const { payload } = await this.jwtService.verify(token);
            if (payload)
                return payload;
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async authTwoFactor(body, inputCode, res) {
        const thisUser = await this.userService.getProfileByUserId(body.id);
        if (thisUser.auth_code === inputCode) {
            const payload = { username: thisUser.username, id: thisUser.user_id };
            const newAccessToken = this.jwtService.sign({ payload });
            res.cookie('token', newAccessToken, { maxAge: 60 * 60 * 1000, httpOnly: false, sameSite: 'lax' });
            res.send({ state: true });
            return;
        }
        else {
            console.log("invalid varification code");
            res.send({ state: false });
        }
        return;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        axios_1.HttpService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map