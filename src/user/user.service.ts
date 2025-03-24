import { Injectable } from '@nestjs/common';
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

    async createUser(firstName: string, lastName: string, email: string, password: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = this.userRepository.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
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

    async changePassword(id: number, newPassword: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new Error('User not found');
        user.password = await bcrypt.hash(newPassword, 10);
        return this.userRepository.save(user)
    }
}
