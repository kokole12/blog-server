import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Email_Queue } from 'src/constants';

@Processor(Email_Queue)
export class SendSignUpEmail {
  private readonly logger = new Logger(SendSignUpEmail.name);
  @Process()
  async sendemail(job: Job<unknown>) {
    return this.logger.log(`sending email to ${JSON.stringify(job.data)}`);
  }
}
