import { NotificationTypeEntity } from '../src/modules/notifications/entities/notification-type.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class AddNotificationTypeRequestUpdate1716395734315 implements Seeder {
    track = true;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const repository = dataSource.getRepository(NotificationTypeEntity);
        await repository.insert({
            id: 2,
            key: 'request.update',
            text: 'Anda memiliki perubahan permintaan ({request_type})',
        });
    }
}
