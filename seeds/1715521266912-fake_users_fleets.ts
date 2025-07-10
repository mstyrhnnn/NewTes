import { FleetsEntity } from '../src/modules/fleets/entities/fleet.entity';
import { UserEntity } from '../src/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class FakeUsersFleets1715521266912 implements Seeder {
    track = true;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        if (process.env.NODE_ENV === 'production') {
            return;
        }

        const userFactory = factoryManager.get(UserEntity);
        await userFactory.saveMany(150);

        const fleetFactory = factoryManager.get(FleetsEntity);
        await fleetFactory.saveMany(100);
    }
}
