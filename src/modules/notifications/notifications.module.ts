import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationObjectEntity } from './entities/notification-object.entity';
import { NotificationViewEntity } from './entities/notification-view.entity';
import { NotificationTypeEntity } from './entities/notification-type.entity';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      NotificationObjectEntity,
      NotificationViewEntity,
      NotificationTypeEntity,
    ]),
    FirebaseModule,
  ],
  providers: [
    NotificationsService,
  ],
  controllers: [
    NotificationsController,
  ],
  exports: [
    NotificationsService,
  ]
})
export class NotificationsModule { }
