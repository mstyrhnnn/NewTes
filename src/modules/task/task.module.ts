import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEntity } from "../orders/entities/orders.entity";
import { DeviceTokensEntity } from '../device_tokens/entities/device_token.entity';
import { NotificationTypeEntity } from '../notifications/entities/notification-type.entity';
import { NotificationHistoryEntity } from '../notifications/entities/notification-history.entity';
import { ScheduleModule } from "@nestjs/schedule";
import { OrderTaskService } from "./services/order-task.service";
import { FleetsEntity } from "../fleets/entities/fleet.entity";
import { UserEntity } from "../users/entities/user.entity";
import { FleetsModule } from "../fleets/fleets.module";
import { QontakModule } from "../qontak/qontak.module";
import { BirthdayService } from './services/birthday.service';
import { ReminderCustomerService } from './services/reminder-customer.service';
import { ServiceReminderService } from "./services/service-reminder.service";
import { LoginStatusCronService } from "./services/login-status.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            OrderEntity,
            FleetsEntity,
            UserEntity,
            DeviceTokensEntity,
            NotificationTypeEntity,
            NotificationHistoryEntity,
        ]),
        ScheduleModule.forRoot(),
        FleetsModule,
        QontakModule,
    ],
    providers: [
        OrderTaskService,
        BirthdayService,
        ReminderCustomerService,
        ServiceReminderService,
        LoginStatusCronService
    ],
    controllers: [],
})

export class TaskModule { }