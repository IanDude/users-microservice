import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './database/entities/users.entity';
import { PasswordUtils } from './util/passwords.helper';
import { getTypeOrmConfig } from './config/typeorm.config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TokenUtils } from './util/tokens.helper';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getTypeOrmConfig(configService),
    }),
    TypeOrmModule.forFeature([Users]),
    ClientsModule.register({
      clients: [
        {
          name: 'ORDERS_SERVICE',
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://localhost:5672'],
            queue: 'orders-queue',
            queueOptions: { durable: true },
          },
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, JwtService, PasswordUtils, TokenUtils],
})
export class AppModule {}
