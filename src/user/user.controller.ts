import { Controller, Post, Get, Param, Put, Body, Query, HttpException, HttpStatus, ConflictException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @ApiOperation({ summary: 'Create user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiResponse({ status: 400, description: 'Create user error' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string', format: 'password' },
                password: { type: 'string', format: 'password' }
            },
        },
    })
    async createUser(
        @Body() body: { firstName: string; lastName: string; email: string; password: string },
    ) {
        return this.userService.createUser(body.firstName, body.lastName, body.email, body.password);
    }

    @Get(':id')
    @ApiOperation({summary: 'get user by id'})
    @ApiResponse({status: 200, description: 'User fetched successfully'})
    @ApiResponse({status: 404, description: 'Error while getting user'})
    @ApiParam({name: 'id', type: 'number', description: 'User Id'})
    async getUserProfile(@Param('id') id: number) {
        return this.userService.getUserProfile(id)
    }

    @Put(':id/password')
    @ApiOperation({summary: 'update password'})
    @ApiResponse({status: 200, description: 'Password updated successfully'})
    @ApiResponse({status: 400, description: 'Error while updating password'})
    @ApiParam({name: 'id', type: 'number', description: 'User id'})
    @ApiBody({
        schema:{
            type:'object',
            properties: {
                newPassword: {type: 'string'}
            }
        }
    })
    async changePassword(
        @Param('id') id: number,
        @Body() body: { newPassword: string },
    ) {
        return this.userService.changePassword(id, body.newPassword);
    }

    @Get('/check-user/:email')
    @ApiOperation({summary: 'Cheks if a user exist by email'})
    @ApiResponse({status: 200, description:'User exists'})
    @ApiResponse({status: 404, description:'user not found'})
    @ApiParam({name: 'email', type: 'string', description: 'user email'})
    async getUserByEmail(@Param('email') email: string) {
        console.log('Received email:', email);
        const user = await this.userService.getUserByEmail(email);
        return !!user;
    }
}
