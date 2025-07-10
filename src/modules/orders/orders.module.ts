import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/orders.entity';
import { FleetsModule } from '../fleets/fleets.module';
import { DeviceTokensModule } from '../device_tokens/device_token.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RequestsModule } from '../requests/requests.module';
import { OrderPgService } from './services/order-pg.service';
import { OrderStatusLogsService } from './services/order-status-logs.service';
import { OrderStatusLogsEntity } from './entities/order-status-logs.entity';
import { InsurancesModule } from '../insurances/insurances.module';
import { MailModule } from '../mail/mail.module';
import { LedgersModule } from '../ledgers/ledgers.module';
import { QontakModule } from '../qontak/qontak.module';
import { FleetsEntity } from '../fleets/entities/fleet.entity';
import { UserEntity } from '../users/entities/user.entity';
import { DiscountEntity } from '../discount/entities/discount.entity';
import { DiscountModule } from '../discount/discount.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      FleetsEntity,
      UserEntity,
      OrderStatusLogsEntity,
      DiscountEntity,
    ]),
    FleetsModule,
    DeviceTokensModule,
    NotificationsModule,
    RequestsModule,
    InsurancesModule,
    MailModule,
    LedgersModule,
    QontakModule,
    DiscountModule,
    UsersModule
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderPgService,
    OrderStatusLogsService,
  ],
})
export class OrdersModule { }
