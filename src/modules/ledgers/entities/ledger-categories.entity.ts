import { Column, Entity } from "typeorm";
import { Base } from "../../../common/database/base.entity";

@Entity('ledger_categories')
export class LedgerCategoriesEntity extends Base {

    constructor(partial: Partial<LedgerCategoriesEntity>) {
        super();
        Object.assign(this, partial);
    }

    @Column()
    name: string;
}

export const isGeneratedCategory = (category: LedgerCategoriesEntity) => {
    return category.id === 1 || category.id === 2;
}