import { AuthService } from './auth.service';
import { Request, Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signUp(code: any, res: Response): Promise<void>;
    checkLoginState(req: Request, res: Response): Promise<void>;
    signOut(req: Request, res: Response): Promise<void>;
    authTwoFactor(body: any, inputCode: string, res: Response): Promise<void>;
    test(): void;
}
