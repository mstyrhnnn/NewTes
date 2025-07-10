import { LedgerCategoriesEntity } from '../src/modules/ledgers/entities/ledger-categories.entity';
import { LedgersEntity } from '../src/modules/ledgers/entities/ledger.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class SeedLedgers1724676081372 implements Seeder {
    track = true;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        if (process.env.NODE_ENV === 'production') {
            return;
        }

        const categoriesRepository = dataSource.getRepository(LedgerCategoriesEntity);

        await categoriesRepository.insert([
            new LedgerCategoriesEntity({
                name: 'Pemasukan Tambahan',
            }),
            new LedgerCategoriesEntity({
                name: 'Pengeluaran Owner',
            }),
        ]);


        const ledgerFactory = factoryManager.get(LedgersEntity);
        await ledgerFactory.saveMany(50);
    }
}
