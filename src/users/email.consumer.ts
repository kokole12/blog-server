import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Email_Queue } from 'src/constants';
import { MailService } from 'src/mail-service/mail-service.service';

@Processor(Email_Queue)
export class SendSignUpEmail {
  private readonly logger = new Logger(SendSignUpEmail.name);
  constructor(private readonly mailService: MailService) {}
  @Process()
  async sendemail(job: Job<unknown>) {
    this.logger.log(`sending email to ${JSON.stringify(job.data)}`);
    const email_to = JSON.stringify(job.data);
    return await this.mailService.sendMailTemplate(email_to);
  }
}
