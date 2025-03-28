import { Injectable } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class MailService {
    private transporter: Transporter;
    private appBaseUrl: string;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        this.appBaseUrl = process.env.NODE_ENV === 'production'
            ? 'https://authb.onrender.com/'
            : 'http://localhost:5173/';
    }

    async sendVerificationEmail(email: string): Promise<void> {
        console.log('Generating verification token for email:', email);
        const verificationToken = this.generateVerificationToken(email);

        console.log(verificationToken, 'log de mailservice sve')

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Please verify your email address',
            text: `Click here to verify your email: ${this.appBaseUrl}verify-email/${verificationToken}`,
        };

        console.log('Sending email:', email);
        await this.transporter.sendMail(mailOptions)
        console.log('Verification email sent:', email);
    }

    async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `Click here to reset your password: ${this.appBaseUrl}auth/reset-password/${token}`,
        };

        await this.transporter.sendMail(mailOptions);
    }

    private generateVerificationToken(email: string): string {
        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey) {
            throw new Error("JWT_SECRET_KEY is not defined");
        }

        return jwt.sign({ email }, secretKey, { expiresIn: '1h' });
    }
}
