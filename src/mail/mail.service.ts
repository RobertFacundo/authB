import { Injectable } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';
import * as handlebars from 'handlebars'

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
            ? 'https://authf-yama.vercel.app/'
            : 'http://localhost:5173/';
    }

    async sendVerificationEmail(email: string): Promise<void> {
        console.log('Generating verification token for email:', email);
        const verificationToken = this.generateVerificationToken(email);
        const verificationLink = `${this.appBaseUrl}verify-email/${verificationToken}`

        console.log(verificationToken, 'log de mailservice sve')

        const template = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>
        <body>
            <div style="max-width: 500px; margin: auto; padding: 20px; 
                        border-radius: 10px; border: 1px solid #444;  box-shadow: 0px 8px 20px rgba(0, 0, 0, 1);
                        font-family: Arial, sans-serif; text-align: center; background-color: #fff;">
                <h2 style="color: #333;">Welcome to my Authentication Project! 🎉</h2>
                <p style="color: #555;">Thank you very much for taking the time to try my authentication project.  
                                        Click the button below to verify your email address.</p>
                <a href="${verificationLink}" 
                    style="display: inline-block; padding: 12px 20px; margin: 20px 0;
                           background-color: #2A2A2A; color: white; text-decoration: none;
                           font-weight: bold; border-radius: 5px;">Verify Email</a>
                <p style="color: #777; font-size: 14px;">If you didn't sign up, please ignore this email.</p>
            </div>
        </body>
        </html>
    `;

        const compiledTemplate = handlebars.compile(template);
        const htmlContent = compiledTemplate({ verificationLink });

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Please verify your email address',
            html: htmlContent,
        };

        await this.transporter.sendMail(mailOptions)
        console.log('Verification email sent:', email);
    }

    async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        console.log(email, 'email que viene de fortgot password service')
        const verificationLink = `${this.appBaseUrl}reset-password/${token}`;

        const template = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>
        <body>
            <div style="max-width: 500px; margin: auto; padding: 20px; 
                        border-radius: 10px; border: 1px solid #444;  box-shadow: 0px 8px 20px rgba(0, 0, 0, 1);
                        font-family: Arial, sans-serif; text-align: center; background-color: #fff;">
                <h2 style="color: #333;">Welcome to my Authentication Project! 🎉</h2>
                <p style="color: #555;">Thank you very much for taking the time to try my authentication project.  
                                        Click the button below to reset your password.</p>
                <a href="${verificationLink}" 
                    style="display: inline-block; padding: 12px 20px; margin: 20px 0;
                           background-color: #2A2A2A; color: white; text-decoration: none;
                           font-weight: bold; border-radius: 5px;">Reset Email</a>
                <p style="color: #777; font-size: 14px;">If you ask to reset your password, please ignore this email.</p>
            </div>
        </body>
        </html>
    `;

        const compiledTemplate = handlebars.compile(template)
        const htmlContent = compiledTemplate({verificationLink})

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: htmlContent,
        };
        console.log(process.env.MAIL_USER, 'log from')
        console.log('Sending email:', email);

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
