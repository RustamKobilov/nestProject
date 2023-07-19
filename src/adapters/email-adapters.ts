import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
@Injectable()
export class EmailAdapters {
  constructor(private mailerService: MailerService) {}
  async gmailSendEmailRegistration(email: string, code: string) {
    await this.mailerService.sendMail({
      from: 'admin <rustamincubator@gmail.com>',
      to: email,
      subject: 'Registration in platform',
      html:
        ' <h1>Thank for your registration</h1>\n' +
        '       <p>To finish registration please follow the link below:\n' +
        "          <a href='https://somesite.com/confirm-email?code=" +
        code +
        "'>complete registration</a>\n" +
        '      </p>',
    });
  }
  async gmailSendEmailPasswordRecovery(email: string, recoveryCode: string) {
    await this.mailerService.sendMail({
      from: 'admin <rustamincubator@gmail.com>',
      to: email,
      subject: 'Password recovery in platform',
      html:
        ' <h1>Password recovery\n' +
        '       <p>To finish password recovery please follow the link below:\n' +
        "          <a href='https://somesite.com/password-recovery?recoveryCode=" +
        recoveryCode +
        "'>recovery password</a>\n" +
        '      </p>',
    });
  }
}
