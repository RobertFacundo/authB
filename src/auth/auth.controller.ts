import { Controller, Post, Body, Param, Put, Get, Res, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly jwtService: JwtService) { }

    @Post('register')
    @ApiOperation({ summary: 'User register' })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 400, description: 'Register error' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', format: 'password' },
                captchaToken: { type: 'string' }
            }
        }
    })
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
    @ApiOperation({ summary: 'Login User' })
    @ApiResponse({ status: 200, description: 'Successfull Login' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', format: 'password' }
            },
        },
    })
    async login(
        @Body() body: { email: string; password: string },
    ) {
        return this.authService.login(body.email, body.password);
    }

    @Get('verification/:token')
    @ApiOperation({ summary: 'Email verification' })
    @ApiParam({ name: 'token', description: 'Verification token' })
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
    @ApiOperation({ summary: 'Password retrieve' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', format: 'email' }
            },
        },
    })
    async forgotPassword(@Body() body: { email: string }) {
        return this.authService.forgotPassword(body.email);
    }

    @Put('reset-password')
    @ApiOperation({ summary: 'Password reset' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string' },
                newPassword: { type: 'string', format: 'password' }
            },
        },
    })
    async resetPassword(
        @Body() body: { token: string, newPassword: string }
    ) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }

    @Get('reset-password/:token')
    @ApiOperation({summary: 'verification token '})
    @ApiParam({name: 'token', description: 'Reset token'})
    async getResetPassword(@Param('token') token: string) {
        try {
            const decoded = await this.jwtService.verifyAsync(token);
            return { message: 'Token is valid. Show reset password form.' };
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    @Get('github')
    @ApiOperation({summary: 'github login'})
    async gitHubLogin(@Res() res: Response) {
        const url = this.authService.getGitHubUrl();
        return res.redirect(url);
    }

    @Get('github/callback')
    @ApiOperation({summary: 'github callback'})
    @ApiQuery({name: 'code', description: 'github code'})
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
