import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class PasswordRecoveryMailService {
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter =
      configService.getOrThrow<string>('NODE_ENV') === 'test'
        ? nodemailer.createTransport({ jsonTransport: true })
        : nodemailer.createTransport({
            host: configService.getOrThrow<string>('SMTP_HOST'),
            port: configService.getOrThrow<number>('SMTP_PORT'),
            secure: configService.getOrThrow<boolean>('SMTP_SECURE'),
            auth: {
              user: configService.getOrThrow<string>('SMTP_USER'),
              pass: configService.getOrThrow<string>('SMTP_PASSWORD'),
            },
          });
  }

  async send(email: string, token: string): Promise<void> {
    const recoveryUrl = new URL(this.configService.getOrThrow<string>('PASSWORD_RECOVERY_URL'));
    recoveryUrl.searchParams.set('token', token);

    await this.transporter.sendMail({
      from: this.configService.getOrThrow<string>('PASSWORD_RECOVERY_FROM_EMAIL'),
      to: email,
      subject: 'Recupera tu acceso a Teralya',
      text:
        'Hemos recibido una solicitud para restablecer tu contraseña. ' +
        `Continúa aquí: ${recoveryUrl.toString()}\n\n` +
        'Si no realizaste esta solicitud, ignora este mensaje.',
    });
  }
}
