import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class MailService {
    private transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false // Esto permitirá aceptar certificados autofirmados
            }
        })
    }

    async sendVerificationEmail(email: string): Promise<void> {
        const verificationToken = this.generateVerificationToken(email);

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Please verify your email address',
            text: `Click here to verify your email: http://your-app.com/auth/verify-email/${verificationToken}`,
        };

        await this.transporter.sendMail(mailOptions)
    }

    // Enviar correo de recuperación de contraseña
    async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            text: `Click here to reset your password: http://your-app.com/auth/reset-password/${token}`,
        };

        await this.transporter.sendMail(mailOptions);
    }

    // Método para generar el token de verificación (en este caso, un JWT)
    private generateVerificationToken(email: string): string {
        // Generar un token JWT con el email
        // Puedes agregar más datos y configurarlo como lo necesites
        return jwt.sign({ email }, 'your_jwt_secret_key', { expiresIn: '1h' }); // Token JWT con expiración de 1 hora
    }
}
