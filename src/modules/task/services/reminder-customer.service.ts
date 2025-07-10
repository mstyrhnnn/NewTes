import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QontakService } from 'src/modules/qontak/qontak.service';
import { OrderEntity } from '../../orders/entities/orders.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { FleetsEntity } from '../../fleets/entities/fleet.entity';
import { DeviceTokensEntity } from '../../device_tokens/entities/device_token.entity';
import { NotificationTypeEntity } from '../../notifications/entities/notification-type.entity';
import { NotificationHistoryEntity } from '../../notifications/entities/notification-history.entity';
import { DateHelper } from 'src/config/helper/date/date.helper';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import * as firebase from 'firebase-admin';

@Injectable()
export class ReminderCustomerService {
    constructor(
        @InjectRepository(OrderEntity) private readonly orderRepository: Repository<OrderEntity>,
        @InjectRepository(FleetsEntity) private readonly fleetsRepository: Repository<FleetsEntity>,
        @InjectRepository(DeviceTokensEntity) private readonly deviceTokenRepository: Repository<DeviceTokensEntity>,
        @InjectRepository(NotificationTypeEntity) private readonly notificationTypeRepository: Repository<NotificationTypeEntity>,
        @InjectRepository(NotificationHistoryEntity) private readonly notificationHistoryRepository: Repository<NotificationHistoryEntity>,
        private qontakService: QontakService,
    ) {}

    private async sendReminderCustomerMessage() {
  
      const data = await this.orderRepository
      .createQueryBuilder('o')
      .select([
        'o.id AS order_id',
        'o.customer_id AS user_id',
        'nt.key AS type_key',
        'nt.text AS text',
        'dt.token AS token',
        'f.name AS car_name',
        'f.plate_number AS plate_number',
      ])
      .innerJoin(DeviceTokensEntity, 'dt', 'dt.user_id = o.customer_id')
      .leftJoin(NotificationTypeEntity, 'nt', `nt.key = (
        CASE 
            WHEN 
              NOW() BETWEEN 
              (o.start_date - INTERVAL '2 hours') 
              AND o.start_date
            THEN 'reminder.duration.start'
            WHEN 
              NOW() BETWEEN 
              ((o.start_date + (o.duration * INTERVAL '1 day')) - INTERVAL '2 hours') 
              AND (o.start_date + (o.duration * INTERVAL '1 day')) 
            THEN 'reminder.duration.end'
            ELSE ''
        END
      )`)
      .leftJoin(NotificationHistoryEntity, 'nh', 'nh.order_id = o.id AND nh.type_key = nt.key')
      .leftJoin(FleetsEntity, 'f', 'f.id = o.fleet_id')
      .where('o.status = :status', { status: 'accepted' })
      .andWhere(
        `(
            NOW() BETWEEN 
            (o.start_date - INTERVAL '2 hours') 
            AND o.start_date
          OR 
            NOW() BETWEEN 
            ((o.start_date + (o.duration * INTERVAL '1 day')) - INTERVAL '2 hours') 
            AND (o.start_date + (o.duration * INTERVAL '1 day'))
        )`,
      )
      .andWhere('nh.order_id IS NULL')
      .getRawMany();
  
      if (data.length > 0) {

        // Mengubah data untuk send notification
        const sendNotification = data.map((row) => {
          var theme = '';
    
          switch(row.type_key) {
            case 'reminder.duration.start':
              theme = 'Pengambilan';
              break;
            case 'reminder.duration.end':
              theme = 'Pengembalian';
              break;
            default:
              break;
          }
    
          row.text = row.text.replace('{car_name}', row.car_name ?? '-');
          row.text = row.text.replace('{plate_number}', row.plate_number ?? '-');
    
          return {
            token: row.token,
            notification: {
              title: 'Waktu ' + theme + ' Rental Anda',
              body: row.text,
            },
          };
        });
    
        // melakukan send notification
        await firebase.messaging().sendEach(sendNotification);
    
        // Mempersiapkan data notification history
        const notificationHistory = data.map((row) => {
          return new NotificationHistoryEntity({
            userId: row.user_id,
            orderId: row.order_id,
            typeKey: row.type_key,
            user: { id: row.user_id } as UserEntity,
          });
        });
    
        // Menyimpan data notification history
        await this.notificationHistoryRepository.save(notificationHistory);
        
      }

      return
    }

    @Cron('*/1 * * * *', { name: 'reminder-customer-service', timeZone: 'UTC' })
    async handleCron() {
      await this.sendReminderCustomerMessage();
    }
}