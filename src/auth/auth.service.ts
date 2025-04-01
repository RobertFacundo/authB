import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import axios from 'axios';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private mailService: MailService,
        private configService: ConfigService,
    ) { }

    async verifyReCaptcha(token: string): Promise<boolean> {
        const secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY');
        const url = `https://www.google.com/recaptcha/api/siteverify`;

        try {
            const response = await axios.post(url, null, {
                params: {
                    secret: secretKey,
                    response: token,
                },
            });

            if (response.data.success) {
                return true;
            } else {
                console.error('reCaptcha verification failed:', response.data);
                return false;
            }
        } catch (error) {
            console.error('Error during reCaptcha verification:', error);
            return false;
        }
    }

    async register(firstName: string, lastName: string, email: string, password: string, captchaToken: string): Promise<any> {
        console.log(captchaToken, 'log antes de verificar')

        const isCaptchValid = await this.verifyReCaptcha(captchaToken);
        if (!isCaptchValid) {
            throw new Error('reCaptcha verification failed')
        }

        try {
            const minLength = 8;
            const maxLength = 20;

            if (password.length < minLength || password.length > maxLength) {
                throw new Error(`Password must be between ${minLength} and ${maxLength} characters.`);
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
            }

            const existingUser = await this.userService.getUserByEmail(email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await this.userService.createUser(firstName, lastName, email, hashedPassword);

            console.log('Sending verification email...');
            await this.mailService.sendVerificationEmail(user.email);

            return { message: 'User registered successfully. Please check your email for verification.' };

        } catch (error) {
            console.error('Error during registration:', error.message);
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    async login(email: string, password: string, captchaToken: string): Promise<any> {
        const isCaptchaValid = await this.verifyReCaptcha(captchaToken);
        if (!isCaptchaValid) {
            throw new Error('reCaptcha verification failed')
        }

        const user = await this.userService.getUserByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('invalid credentials');
        }

        const secretKey = this.configService.get<string>('JWT_SECRET_KEY');
        const payload = { email: user.email, sub: user.id };

        console.log('JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY);

        const token = this.jwtService.sign(payload, { secret: secretKey });

        return { access_token: token }
    }

    async verifyEmail(token: string): Promise<any> {
        try {
            const decoded = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET_KEY,
            });

            if (!decoded || !decoded.email) {
                throw new Error('Invalid token');
            }

            const user = await this.userService.getUserByEmail(decoded.email);
            if (!user) {
                throw new Error('User not found');
            }

            user.isActive = true;
            await this.userService.updateUser(user);

            return { message: 'Email verified successfully!', success: true };
        } catch (error) {
            console.error('Error during email verification:', error);
            throw new Error(`Failed to verify email: ${error.message}`);
        }
    }

    async forgotPassword(email: string): Promise<any> {
        const user = await this.userService.getUserByEmail(email);
        if (!user) throw new Error('User not found');

        const secretKey = this.configService.get<string>('JWT_SECRET_KEY');

        const token = this.jwtService.sign(
            { email: user.email, sub: user.id },
            {
                secret: secretKey,
                expiresIn: '1h'
            }
        );
        await this.mailService.sendPasswordResetEmail(user.email, token);

        return { message: 'Password reset link has been sent to your email.', token: token }
    }

    async resetPassword(token: string, newPassword: string): Promise<any> {
        const user = await this.jwtService.verifyAsync(token);
        if (!user) throw new Error('Invalid token');

        const foundUser = await this.userService.getUserProfile(user.sub);

        if (!foundUser) {
            throw new Error('User not found');
        }

        foundUser.password = await bcrypt.hash(newPassword, 10);
        await this.userService.changePassword(foundUser?.id, foundUser?.password);

        return { message: 'Password has been successfully updated' }
    }

    getGitHubUrl(): string {
        const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
        const redirectedUrl = this.configService.get<string>('GITHUB_CALLBACK_URL');

        return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectedUrl}&scope=user:email`;
    }


    async githubLogin(code: string): Promise<string> {

        const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
        const clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');

        try {
            const tokenResponse = await axios.post(
                'https://github.com/login/oauth/access_token',
                {
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                },
                { headers: { Accept: 'application/json' } },
            );

            const accessToken = tokenResponse.data.access_token;
            if (!accessToken) {
                console.error('GitHub authentication failed. No access token received.');
                throw new Error('GitHub authentication Failed')
            };

            const userResponse = await axios.get('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            const userEmailResponse = await axios.get('https://api.github.com/user/emails', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            interface GitHubEmail {
                email: string;
                primary: boolean;
                verified: boolean;
                visibility: string | null;
            }

            const userEmails: GitHubEmail[] = userEmailResponse.data;
            const userEmail = userEmails.find((email) => email.primary)?.email;

            if (!userEmail) {
                console.error('GitHub user does not have a primary email');
                throw new Error('GitHub user does not have a primary email');
            }

            let user = await this.userService.getUserByEmail(userEmail);

            if (!user) {
                user = await this.userService.createUser(userResponse.data.name, '', userEmail, '', true);
            }

            const payload = { sub: user.id, email: user.email };
            return this.jwtService.sign(payload, { secret: this.configService.get<string>('JWT_SECRET_KEY') });

        } catch (error) {
            throw new Error('GitHub login failed: ' + error.message);
        }
    }
}
