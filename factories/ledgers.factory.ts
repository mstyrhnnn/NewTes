import { setSeederFactory } from "typeorm-extension";
import { LedgersEntity } from "../src/modules/ledgers/entities/ledger.entity.js";
import { LedgerStatus } from "../src/modules/ledgers/enums/ledger-status.enum";

export default setSeederFactory(LedgersEntity, async (faker) => {
    const isCredit = faker.number.int(1);
    const status = faker.helpers.arrayElement([LedgerStatus.ON_HOLD, LedgerStatus.PROCCESSED]);

    return new LedgersEntity({
        date: faker.date.recent(),
        credit_amount: isCredit ? faker.number.int({
            min: 10_000,
            max: 500_000,
        }) : null,
        debit_amount: isCredit ? null : faker.number.int({
            min: 10_000,
            max: 500_000,
        }),
        category_id: isCredit ? 4 : 3,
        fleet_id: 1,
        status,
    });
});
