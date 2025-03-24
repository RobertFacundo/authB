import { Controller, Post, Body, Param, Put } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

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

    @Post('verify-email')
    async verifyEmail(@Body() body: { token: string }) {
        return this.authService.verifyEmail(body.token);
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

    // @Post('oauth')
    // async ouauthLogin(@Body() body: {provider: string, accesToken: string}){
    //     return this.authService.ouauthLogin(body.provider, body.accesToken)
    // }
}
