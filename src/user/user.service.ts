import { Injectable } from '@nestjs/common';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async createUser(firstName: string, lastName: string, email: string, password: string, isOAuth: boolean = false): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = this.userRepository.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            isOAuth,
        });
        return this.userRepository.save(newUser);
    }

    async validatePassword(email: string, password: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) return false;
        return bcrypt.compare(password, user.password);
    }

    async getUserProfile(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } })
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } })
    }

    async changePassword(id: number, newPassword: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new Error('User not found');
        user.password = await bcrypt.hash(newPassword, 10);
        return this.userRepository.save(user)
    }

    async updateUser(user: User): Promise<User> {
        const existingUser = await this.userRepository.findOne({ where: { id: user.id } });
        if (!existingUser) throw new Error('User not found');

        existingUser.firstName = user.firstName || existingUser.firstName;
        existingUser.lastName = user.lastName || existingUser.lastName;
        existingUser.email = user.email || existingUser.email;
        existingUser.isActive = user.isActive !== undefined ? user.isActive : existingUser.isActive;

        return this.userRepository.save(existingUser);
    }
}
