import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException, Injectable, HttpException, HttpStatus } from '@nestjs/common';

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
        	from: 'tehyoyee@gmail.com',
        	subject: 'Here\'s your verification code',
        	text: `Verification Code = ${code}`,
      	})
    	.then((result) => {
        	console.log(result);
      	})
      	.catch((error) => {
        	throw new HttpException('mailing error', HttpStatus.);
      	});
    	return code;
  	}
}
