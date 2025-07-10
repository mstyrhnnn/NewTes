import { NotificationTypeEntity } from '../src/modules/notifications/entities/notification-type.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class CreateNotificationType1715435464970 implements Seeder {
    track = true;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const repository = dataSource.getRepository(NotificationTypeEntity);
        await repository.insert({
            id: 1,
            key: 'request.create',
            text: 'Anda memiliki permintaan baru ({request_type})',
        });
    }
}
