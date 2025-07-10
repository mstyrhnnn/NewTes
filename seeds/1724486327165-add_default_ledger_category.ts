import { OrderEntity } from '../src/modules/orders/entities/orders.entity';
import { LedgerCategoriesEntity } from '../src/modules/ledgers/entities/ledger-categories.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { LedgersEntity } from '../src/modules/ledgers/entities/ledger.entity';
import { getLedgerStatusFromPaymentStatus } from 'src/modules/ledgers/enums/ledger-status.enum';
import { PriceHelper } from '../src/config/helper/price/price.helper';

export class AddDefaultLedgerCategory1724486327165 implements Seeder {
    track = true;

    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        // Insert default ledger categories
        const categoriesRepository = dataSource.getRepository(LedgerCategoriesEntity);
        await categoriesRepository.insert([
            new LedgerCategoriesEntity({
                name: 'Sewa (Otomatis)',
            }),
            new LedgerCategoriesEntity({
                name: 'Luar Kota 1 Hari (Otomatis)',
            }),
        ]);

        // Migrate existing orders to the new ledger
        const orderRepository = dataSource.getRepository(OrderEntity);
        const ledgerRepository = dataSource.getRepository(LedgersEntity);

        const orders = await orderRepository
            .createQueryBuilder('o')
            .innerJoinAndSelect('o.fleet', 'fleet')
            .addSelect('o.customer_id')
            .withDeleted()
            .andWhere('o.deleted_at IS NULL')
            .getMany();

        await Promise.all(orders.map(async order => {
            const ledger = {
                order_id: order.id,
                date: order.start_date,
                duration: order.duration,
                fleet_id: order.fleet.id,
                status: getLedgerStatusFromPaymentStatus(order.payment_status),
                user_id: order.customer_id,
            };

            // Order ledger
            const orderLedger = new LedgersEntity({
                ...ledger,
                category_id: 1,
                debit_amount: PriceHelper.calculateDiscountedPrice(order.fleet.price * order.duration, order.discount),
                description: `Sewa ${order.fleet.type_label}`,
            });
            await ledgerRepository.save(orderLedger);

            // Out of town ledger
            if (order.is_out_of_town) {
                const outOfTownLedger = new LedgersEntity({
                    ...ledger,
                    category_id: 2,
                    debit_amount: PriceHelper.calculateDiscountedPrice(order.out_of_town_price, order.discount),
                    duration: null,
                    description: `Luar Kota ${order.fleet.type_label}`,
                });
                await ledgerRepository.save(outOfTownLedger);
            }
        }));
    }
}
