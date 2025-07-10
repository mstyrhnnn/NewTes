import { Base } from "src/common/database/base.entity";
import { Column, Entity, Index } from "typeorm";

@Entity({
    name: 'order_insurances',
})
export class InsuranceEntity extends Base {

    constructor(partial: Partial<InsuranceEntity>) {
        super();
        Object.assign(this, partial);
    }

    @Index({ unique: true })
    @Column()
    code: string;

    @Column()
    name: string;

    @Column({
        nullable: true,
    })
    description: string;

    @Column({
        type: 'double precision',
    })
    price: number;
}