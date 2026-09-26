import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('USERS.CREATEONE')
  async CreateOne(@Payload() data: CreateUserDto) {
    return await this.appService.createOne(data);
  }

  @MessagePattern('USERS.FINDALL')
  async FindAll() {
    return await this.appService.getAll();
  }

  @EventPattern('USERS.LOGIN')
  loginNotif() {
    this.appService.loginNotif();
  }

  @MessagePattern('USERS.GETONE')
  async FindOne(@Payload() data: { uuid: string }) {
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
  onSystemAuditLog(data: { endpoint: string; error: string; timestamp: Date }) {
    return this.appService.onSystemAuditLog(data);
  }
}
