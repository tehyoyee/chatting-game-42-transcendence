import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { MailService } from './mail.service';
export declare class AuthService {
    private userService;
    private jwtService;
    private httpService;
    private mailService;
    constructor(userService: UserService, jwtService: JwtService, httpService: HttpService, mailService: MailService);
    signUp(code: string, res: Response): Promise<void>;
    checkLoginState(req: Request, res: Response): Promise<void>;
    signOut(req: Request, res: Response): Promise<void>;
    verifyToken(token: string): Promise<any>;
    verifyTokenSocket(token: string): Promise<any>;
    authTwoFactor(body: any, inputCode: any, res: Response): Promise<void>;
}
