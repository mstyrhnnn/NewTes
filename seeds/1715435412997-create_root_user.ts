import { UserRoleEnum } from '../src/modules/users/enums/user.role.enum';
import { PasswordHashHelper } from '../src/config/helper/hash/password-hash.helper';
import { UserEntity } from '../src/modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { UserStatusEnum } from '../src/modules/users/enums/user.status.enum.js';

export class CreateRootUser1715435412997 implements Seeder {
    track = true;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const repository = dataSource.getRepository(UserEntity);
        await repository.insert([
            {
                name: 'Root',
                email: 'root@example.com',
                password: await PasswordHashHelper.hash('secret'),
                role: UserRoleEnum.ADMIN,
                status: UserStatusEnum.VERIFIED,
            },
            {
                name: 'Driver',
                email: 'driver@example.com',
                password: await PasswordHashHelper.hash('secret'),
                role: UserRoleEnum.DRIVER,
                status: UserStatusEnum.VERIFIED,
            },
            {
                name: 'Customer',
                email: 'luthfiarifin011@gmail.com',
                phone_number: '62816268016',
                password: await PasswordHashHelper.hash('secret'),
                role: UserRoleEnum.CUSTOMER,
                status: UserStatusEnum.VERIFIED,
            },
        ]);
    }
}
