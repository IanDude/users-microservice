import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './database/entities/users.entity';
import { Repository } from 'typeorm';
import { PasswordUtils } from './util/passwords.helper';
import { RpcException } from '@nestjs/microservices';
import { TokenUtils } from './util/tokens.helper';
import { Payload } from './interfaces/payload.interface';
import { User } from './interfaces/user.interface';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    private readonly passwordUtil: PasswordUtils,
    private readonly tokenHelper: TokenUtils,
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
    return await this.usersRepository.find();
  }

  async login(userData) {
    const payload: Payload = {
      sub: userData.id,
      username: userData.username,
    };

    const accessToken = await this.tokenHelper.generateAccessToken(payload);

    return { access_token: accessToken };
  }

  loginNotif() {
    console.log(`Notification that user is logged in`);
  }

  async findOne(userData: { uuid?: string; username?: string; id?: number }) {
    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     const user = this.usersRepository.findOne({
    //       where: { uuid: uuid },
    //     });
    //     resolve(user);
    //   }, 2900);
    // });
    let user: Users | null = null;
    if (userData.id) {
      user = await this.usersRepository.findOne({
        where: { id: userData.id },
      });
    } else if (userData.uuid) {
      user = await this.usersRepository.findOne({
        where: { uuid: userData.uuid },
      });
    } else if (userData.username) {
      user = await this.usersRepository.findOne({
        where: { username: userData.username },
      });
    }
    if (!user) throw new RpcException('User not found');
    return user;
  }

  async validateLocal(userData: { username: string; password: string }) {
    const user: User | null = await this.findOne({
      username: userData.username,
    });

    if (!user) throw new RpcException('Invalid Credentials');

    const passwordMatched = await this.passwordUtil.comparePasswords(
      userData.password,
      user.password || '',
    );

    if (!passwordMatched) throw new RpcException('Invalid Credentials');
    delete user.password;
    return user;
  }

  async validateJwt(payload: { sub: number; username: string }) {
    const user: User = await this.findOne({ id: payload.sub });
    // const { password, ...result } = user;
    delete user.password;
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
