import { InsuranceEntity } from '../src/modules/insurances/entities/insurances.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class InitOrder1718463326559 implements Seeder {
    track = false;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        // Insurances
        const insurances: InsuranceEntity[] = [
            new InsuranceEntity({
                name: 'Perlindungan Silver',
                description: 'Perlindungan s.d. Rp. 50jt',
                price: 15000,
                code: 'silver',
            }),
            new InsuranceEntity({
                name: 'Perlindungan Gold',
                description: 'Perlindungan s.d. Rp. 100jt',
                price: 20000,
                code: 'gold',
            }),
            new InsuranceEntity({
                name: 'Perlindungan Platinum',
                description: 'Meng-cover semua kerusakan dan kehilangan.',
                price: 25000,
                code: 'platinum',
            })
        ]
        const insuranceRepository = dataSource.getRepository(InsuranceEntity);
        await insuranceRepository.upsert(insurances, ['code']);
    }
}
