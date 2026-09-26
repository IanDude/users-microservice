import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './database/entities/users.entity';
import { Repository } from 'typeorm';
import { PasswordUtils } from './util/passwords.helper';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    private readonly passwordUtil: PasswordUtils,
  ) {}

  async createOne(userData: CreateUserDto) {
    const { password, ...details } = userData;
    const hashedPassword = await this.passwordUtil.hashPassword(password);
    const newUser = this.usersRepository.create({
      ...details,
      password: hashedPassword,
    });
    await this.usersRepository.save(newUser);
    return `User: ${newUser.username} is successfully registered`;
  }

  async getAll() {
    console.log('Find All in users is called while offline');
    return await this.usersRepository.find();
  }

  loginNotif() {
    console.log(`Notification that user is logged in`);
  }

  async findOne(uuid: string) {
    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     const user = this.usersRepository.findOne({
    //       where: { uuid: uuid },
    //     });
    //     resolve(user);
    //   }, 2900);
    // });

    const user = await this.usersRepository.findOne({ where: { uuid: uuid } });
    if (!user) throw new RpcException('User not found');
    return user;
  }

  async getFast() {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ message: 'What took you so long' }), 5000);
    });
  }

  onOrderPlaced(userId: number) {
    console.log(`Sending order confirmation email to User ${userId}`);
  }

  onSystemAuditLog(data: { endpoint: string; error: string; timestamp: Date }) {
    console.log({
      endpoint: data.endpoint,
      error: data.error,
      timestamp: data.timestamp,
    });
  }
}
