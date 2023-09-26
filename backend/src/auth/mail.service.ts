import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
	constructor(private readonly mailerService: MailerService) {}

	secondAuthentication(clientEmail: string): string {
    	const generateRandomString = ( len: number) => {
			const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
			let randomString: string = '';
			for (let i = 0; i < len; i++) {
			const rnum = Math.floor(Math.random() * chars.length);
			randomString += chars.substring(rnum, rnum + 1);
			}
			return String(randomString);
		}
		const code = generateRandomString(6);
		this.mailerService
    		.sendMail({
        	to: `${clientEmail}`,
        	from: 'transcendence@42seoul.com',
        	subject: 'Here\'s your verification code',
        	text: `Verification Code = ${code}`,
      	})
    	.then((result) => {
        	// console.log(result);
      	})
      	.catch((error) => {
        	return null;
      	});
    	return code;
  	}
}
