import { UserEntity } from 'src/modules/users/entities/user.entity';
import { UserRoleEnum } from 'src/modules/users/enums/user.role.enum.ts';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class AddFakeOwners1723571612218 implements Seeder {
    track = true;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        if (process.env.NODE_ENV === 'production') {
            return;
        }

        const userFactory = factoryManager.get(UserEntity);
        await userFactory.saveMany(50, {
            role: UserRoleEnum.OWNER,
        });
    }
}
