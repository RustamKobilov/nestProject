import nodemailer from 'nodemailer';
const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rustamincubator@gmail.com',
    pass: 'poznkvwenjowduaq',
  },
});

export const emailAdapters = {
  async gmailSendEmailRegistration(email: string, code: string) {
    const info = await transport.sendMail({
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
  },
  async gmailSendEmailPasswordRecovery(email: string, recoveryCode: string) {
    const info = await transport.sendMail({
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
  },
};
