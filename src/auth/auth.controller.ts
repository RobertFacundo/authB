import { Controller, Post, Body, Param, Put, Get, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly jwtService: JwtService) { }

    @Post('register')
    async register(
        @Body() body: { firstName: string, lastName: string, email: string, password: string },
    ) {
        return this.authService.register(body.firstName, body.lastName, body.email, body.password);
    }

    @Post('login')
    async login(
        @Body() body: { email: string; password: string },
    ) {
        return this.authService.login(body.email, body.password);
    }

    @Get('verify-email/:token')
    async verifyEmail(@Param('token') token: string): Promise<any> {
        try {
            const result = await this.authService.verifyEmail(token);
            return { message: 'Your email has been successfully verified!', success: true };
        } catch (error) {
            return { message: 'There was an error verifying your email: ' + error.message, success: false }; // En caso de error
        }
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: { email: string }) {
        return this.authService.forgotPassword(body.email);
    }

    @Put('reset-password')
    async resetPassword(
        @Body() body: { token: string, newPassword: string }
    ) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }

    @Get('reset-password/:token')
    async getResetPassword(@Param('token') token: string) {
        try {
            const decoded = await this.jwtService.verifyAsync(token);
            return { message: 'Token is valid. Show reset password form.' };
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    @Get('github')
    async gitHubLogin(@Res() res: Response) {
        const url = this.authService.getGitHubUrl();
        return res.redirect(url);
    }

    @Get('github/callback')
    async gitHubCallback(@Query('code') code: string, @Res() res: Response) {
        try {
            const token = await this.authService.githubLogin(code);
            return res.json({ message: 'Authentication successful', token });
        } catch (error) {
            console.error(error);
            return res.status(400).json({ message: 'Authentication failed', error: error.message });
        }
    }

}
