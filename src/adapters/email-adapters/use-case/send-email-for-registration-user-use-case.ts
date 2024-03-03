import { CommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';

export class SendEmailForRegistrationUserUseCaseCommand {
  constructor(public email: string, public code: string) {}
}

@CommandHandler(SendEmailForRegistrationUserUseCaseCommand)
export class SendEmailForRegistrationUserUseCase {
  constructor(/*private mailerService: MailerService*/) {}

  async execute(command: SendEmailForRegistrationUserUseCaseCommand) {
    //   await this.mailerService.sendMail({
    //     from: 'admin <rustamincubator@gmail.com>',
    //     to: command.email,
    //     subject: 'Registration in platform',
    //     html:
    //       ' <h1>Thank for your registration</h1>\n' +
    //       '       <p>To finish registration please follow the link below:\n' +
    //       "          <a href='https://somesite.com/confirm-email?code=" +
    //       command.code +
    //       "'>complete registration</a>\n" +
    //       '      </p>',
    //   });
  }
}
//TODO закоментил mailer modle и логику что то не так с пакетом внутри модуля 26.02.24
// версионность скорее всего, поставить mailer старым как вариант
