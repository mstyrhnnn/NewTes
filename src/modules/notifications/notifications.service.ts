import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationObjectEntity } from './entities/notification-object.entity';
import { NotificationEntity } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { NotificationViewEntity } from './entities/notification-view.entity';
import { NotificationTypeEntity } from './entities/notification-type.entity';
import { FirebaseService } from '../firebase/firebase.service';
import { NotificationTypeEnum } from './enum/notification-type.enum';
import { GetNotificationPaginationDto } from './dto/get-notifications-pagination.dto';
import { PaginationHelper } from 'src/config/helper/pagination/pagination.helper';
import { replaceRequestTypeText } from '../requests/enums/request.type.enum';

@Injectable()
export class NotificationsService {

    constructor(
        @InjectRepository(NotificationEntity) readonly notificationRepository: Repository<NotificationEntity>,
        @InjectRepository(NotificationTypeEntity) readonly notificationTypeRepository: Repository<NotificationTypeEntity>,
        @InjectRepository(NotificationViewEntity) readonly notificationViewRepository: Repository<NotificationViewEntity>,
        @InjectRepository(NotificationObjectEntity) readonly notificationObjectRepository: Repository<NotificationObjectEntity>,
        private firebaseService: FirebaseService,
    ) { }

    private getNotificationObjectBuilder(entityTypeId: number, entityId) {
        const notificationObjectBuilder = this.notificationObjectRepository.createQueryBuilder('notification_object')
            .where('notification_object.type_id = :entityTypeId', { entityTypeId });

        switch (entityTypeId) {
            case NotificationTypeEnum['request.create']:
                notificationObjectBuilder.andWhere('notification_object.request_id = :entityId', { entityId });
                break;
            default:
                break;
        }

        return notificationObjectBuilder;
    }

    async createNotification(entityTypeId: number, entityId, notifierId?: number | number[]) {
        let notificationObject = await this.getNotificationObjectBuilder(entityTypeId, entityId).getOne();

        if (!notificationObject) {
            notificationObject = await this.notificationObjectRepository.save(new NotificationObjectEntity({
                type_id: entityTypeId,
                request_id: entityTypeId === NotificationTypeEnum['request.create'] || entityTypeId === NotificationTypeEnum['request.update'] ? entityId : null,
            }));
        }

        let notification;

        if (!notifierId) {
            notification = await this.notificationRepository.save(new NotificationEntity({ notifier_id: null, object_id: notificationObject.id }));
        } else {
            if (Array.isArray(notifierId)) {
                await notifierId?.forEach(async (val) => {
                    notification = await this.notificationRepository.save(new NotificationEntity({ notifier_id: val, object_id: notificationObject.id }));
                });
            } else {
                notification = await this.notificationRepository.save(new NotificationEntity({ notifier_id: notifierId, object_id: notificationObject.id }));
            }
        }

        this.sendFirebase(notification.id, notifierId);

        return true;
    }

    async removeNotification(entityTypeId: number, entityId) {
        const removeBuilder = await this.getNotificationObjectBuilder(entityTypeId, entityId);
        return removeBuilder
            .softDelete()
            .execute();
    }

    async getNotification(userId: number, dto: GetNotificationPaginationDto) {
        const builder = this.notificationRepository.createQueryBuilder('q')
            .where('q.notifier_id = :userId OR q.notifier_id IS NULL', { userId })
            .innerJoinAndSelect('q.object', 'object')
            .innerJoinAndSelect('object.type', 'type')
            .leftJoinAndSelect('q.view', 'view')
            .leftJoinAndSelect('object.request', 'request')
            .leftJoinAndSelect('request.order', 'request_order')
            .orderBy('q.id', 'DESC');

        return PaginationHelper.pagination(builder, dto);
    }

    async getUnreadCount(userId: number) {
        const count = await this.notificationRepository.createQueryBuilder('q')
            .where('q.notifier_id = :userId', { userId })
            .leftJoin('q.view', 'view')
            .andWhere('view.id IS NULL')
            .getCount();

        return {
            count,
        };
    }

    async viewNotification(notificationId: number, userId: number) {
        const notification = await this.notificationRepository.createQueryBuilder('a')
            .where('a.id = :notificationId', { notificationId })
            .andWhere('(a.notifier_id = :userId OR a.notifier_id IS NULL)', { userId })
            .getOne();

        if (!notification) {
            throw new ForbiddenException('Request denied');
        }

        return await this.notificationViewRepository.save(new NotificationViewEntity({
            user_id: userId,
            notification_id: notificationId,
        }));
    }

    async getNotificationType(key:string) {
        const data = await this.notificationTypeRepository
        .createQueryBuilder('nv')
        .where('nv.key = :key', { key })
        .getOne();

        return data;
    }

    private async sendFirebase(notificationId: number, userIds) {
        const notification = this.mapNotification((
            await this.notificationRepository.createQueryBuilder('q')
                .where('q.id = :notificationId', { notificationId })
                .innerJoinAndSelect('q.object', 'object')
                .innerJoinAndSelect('object.type', 'type')
                .leftJoinAndSelect('object.request', 'request')
                .getOne()
        ));

        return await this.firebaseService.sendMessage(
            {
                title: notification.title,
                body: notification.text,
            },
            userIds,
            {
                type: notification.type,
                body: {
                    id: notification.id.toString(),
                    text: notification.text,
                    title: notification.title,
                },
            }
        );
    }

    private mapNotification(notification: NotificationEntity) {
        const viewed = notification.view !== undefined && notification.view !== null;
        var text = notification.object.type.text;

        let source;

        switch (notification?.object?.type?.id) {
            case NotificationTypeEnum['request.create']:
                const request = notification?.object?.request;
                source = {
                    id: request?.id,
                };
                text = replaceRequestTypeText(text, request?.type, request?.is_self_pickup);
                break;
            default:
                break;
        }

        return {
            id: notification.id,
            source: source,
            type: notification?.object?.type?.key,
            text: text,
            title: 'Transgo',
            viewed,
        };
    }
}
