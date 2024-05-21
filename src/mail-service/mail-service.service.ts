import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly fromEmail: string;
  private readonly toEmail: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.fromEmail = this.configService.get<string>(
      'MAIL_FROM',
      'kokoleismail@gmail.com',
    );
    this.toEmail = this.configService.get<string>(
      'MAIL_TO',
      'kokoleismail886@gmail.com',
    );
  }

  getHello(): string {
    return 'Hello World!';
  }

  async sendMailTemplate(): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: this.toEmail,
        from: this.fromEmail,
        subject: 'Testing Node Mailer with NestJS',
        template: './welcome',
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
