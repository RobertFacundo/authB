import { Controller, Post, Get, Param, Put, Body, Query, HttpException, HttpStatus, ConflictException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    async createUser(
        @Body() body: { firstName: string; lastName: string; email: string; password: string },
    ) {
        return this.userService.createUser(body.firstName, body.lastName, body.email, body.password);
    }

    @Get(':id')
    async getUserProfile(@Param('id') id: number) {
        return this.userService.getUserProfile(id)
    }

    @Put(':id/password')
    async changePassword(
        @Param('id') id: number,
        @Body() body: { newPassword: string },
    ) {
        return this.userService.changePassword(id, body.newPassword);
    }

    @Get('/check-user/:email')
    async getUserByEmail(@Param('email') email: string) {
        console.log('Received email:', email);
        const user = await this.userService.getUserByEmail(email);
        return !!user;  
    }
}
