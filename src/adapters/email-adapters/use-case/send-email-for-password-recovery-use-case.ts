import { MailerService } from '@nestjs-modules/mailer';
import { CommandHandler } from '@nestjs/cqrs';

export class SendEmailForPasswordRecoveryUseCaseCommand {
  constructor(public email: string, public recoveryCode: string) {}
}

@CommandHandler(SendEmailForPasswordRecoveryUseCaseCommand)
export class SendEmailForPasswordRecoveryUseCase {
  constructor(/*private mailerService: MailerService*/) {}

  async execute(command: SendEmailForPasswordRecoveryUseCaseCommand) {
    // await this.mailerService.sendMail({
    //   from: 'admin <rustamincubator@gmail.com>',
    //   to: command.email,
    //   subject: 'Password recovery in platform',
    //   html:
    //     ' <h1>Password recovery\n' +
    //     '       <p>To finish password recovery please follow the link below:\n' +
    //     "          <a href='https://somesite.com/password-recovery?recoveryCode=" +
    //     command.recoveryCode +
    //     "'>recovery password</a>\n" +
    //     '      </p>',
    // });
  }
}
