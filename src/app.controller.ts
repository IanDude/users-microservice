import { Controller, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
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

  @EventPattern('USERS.LOGIN')
  loginNotif(@Ctx() context: RmqContext) {
    this.appService.loginNotif(context);
  }

  @MessagePattern('USERS.GETONE')
  async FindOne(@Payload() data: { uuid: string }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    console.log(channel);
    console.log(message);
    channel.ack(message);
    return await this.appService.findOne(data.uuid);
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
