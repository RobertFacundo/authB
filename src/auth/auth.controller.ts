import { Controller, Post, Body, Param, Put, Get, Res, Query, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Express } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly jwtService: JwtService) { }

    @Post('register')
    async register(
        @Body() body: { firstName: string, lastName: string, email: string, password: string, captchaToken: string },
    ) {
        try {
            console.log(body, 'log desde el backend render')
            const { firstName, lastName, email, password, captchaToken } = body;
            return await this.authService.register(firstName, lastName, email, password, captchaToken);
        } catch (error) {
            console.error('Error during registration:', error.message);
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: error.message,
            }, HttpStatus.BAD_REQUEST);
        }
    }

    @Post('login')
    @UseGuards(ThrottlerGuard)
    async login(
        @Body() body: { email: string; password: string, captchaToken: string },
    ) {
        return this.authService.login(body.email, body.password, body.captchaToken);
    }

    @Get('verification/:token')
    async verifyEmail(@Param('token') token: string, @Res() res: Response): Promise<any> {
        try {
            const result = await this.authService.verifyEmail(token);
            return res.status(200).json({ message: 'Your email has been successfully verified!', success: true });
        } catch (error) {
            console.error('Error in controller:', error);
            return res.status(500).json({
                message: 'There was an error verifying your email: ' + error.message,
                success: false
            });
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
        if (!code) {
            return res.status(400).json({ message: 'Missing code parameter' });
        }
    
        const token = await this.authService.githubLogin(code);

        if (token) {
            return res.json(token);
        } else {
            return res.status(400).json({ message: 'GitHub login failed' });
        }
    }
}
