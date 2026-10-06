import { Controller, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('ORDERS_SERVICE') private ordersClient: ClientProxy,
  ) {}

  @MessagePattern('USERS.CREATEONE')
  async CreateOne(@Payload() data: CreateUserDto) {
    return await this.appService.createOne(data);
  }

  @MessagePattern('USERS.FINDALL')
  async FindAll() {
    return await this.appService.getAll();
  }

  @EventPattern('USERS.LOGINNOTIF')
  loginNotif() {
    this.appService.loginNotif();
  }

  @MessagePattern('USERS.LOGIN')
  async login(@Payload() userData) {
    return await this.appService.login(userData);
  }

  @MessagePattern('USERS.GETONE')
  async FindOne(
    @Payload() userData: { uuid?: string; username?: string; id?: number },
    // @Ctx() context: RmqContext,
  ) {
    // const channel = context.getChannelRef();
    // const message = context.getMessage();
    // console.log(channel);
    // console.log(message);
    // channel.ack(message);
    return await this.appService.findOne(userData);
  }

  @MessagePattern('USERS.VALIDATE_LOCAL')
  async onLocalValidate(
    @Payload() userData: { username: string; password: string },
  ) {
    return await this.appService.validateLocal(userData);
  }

  @MessagePattern('USERS.VALIDATE_JWT')
  async onJwtValidate(@Payload() payload: { sub: number; username: string }) {
    return await this.appService.validateJwt(payload);
  }

  @MessagePattern('USERS.FAST')
  async getFast() {
    return await this.appService.getFast();
  }

  @EventPattern('USERS.ORDER_PLACED')
  orderPlaced(@Payload() data: { userId: number }) {
    return this.appService.onOrderPlaced(data.userId);
  }

  @EventPattern('SYSTEM.AUDIT_LOG')
  onSystemAuditLog(
    @Payload() data: { endpoint: string; error: string; timestamp: Date },
  ) {
    return this.appService.onSystemAuditLog(data);
  }

  @EventPattern('ORDER.CREATED')
  processPayment(@Payload() order: { id: number; status: string }) {
    const isDeclined = Math.random() > 0.5;

    if (isDeclined) {
      console.log('Payment DECLINED for order', order.id);

      this.ordersClient.emit('PAYMENT.FAILED', {
        orderId: order.id,
        reason: 'Card Declined',
      });
    } else {
      this.ordersClient.emit('PAYMENT.SUCCESS', { orderId: order.id });
    }
  }
}
