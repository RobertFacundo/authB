import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private mailService: MailService,
        private configService: ConfigService,
    ) { }

    async register(firstName: string, lastName: string, email: string, password: string): Promise<any> {
        const existingUser = await this.userService.getUserByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const user = await this.userService.createUser(firstName, lastName, email, password);

        // await this.mailService.sendVerificationEmail(user.email);

        return { message: 'User registered successfully. Please check your email for verification.' };
    }

    async login(email: string, password: string): Promise<any> {
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
            // Verifica el token JWT
            const user = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET_KEY,
            });

            if (!user) {
                throw new Error('Invalid token');
            }

            // Busca al usuario en la base de datos
            const foundUser = await this.userService.getUserProfile(user.sub);

            if (!foundUser) {
                throw new Error('User not found');
            }

            // Marca al usuario como activo
            foundUser.isActive = true;
            await this.userService.updateUser(foundUser);

            return { message: 'Email verified successfully' };

        } catch (error) {
            // Lanza el error con un mensaje más específico
            console.error('Error during email verification:', error); // Log para depuración
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
        // await this.mailService.sendPasswordResetEmail(user.email, token);

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

    // async oauthLogin(provider: string, access_token: string): Promise<any>{

    // }
}
