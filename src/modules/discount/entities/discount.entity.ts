import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Base } from "../../../common/database/base.entity";
import { LocationEntity } from "src/modules/locations/entities/location.entity";

@Entity({
    name: 'fleet_discount',
})
export class DiscountEntity extends Base {

    @Column()
    discount: number;

    @Column()
    location_id: number;

    @Column()
    fleet_type: string;

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    constructor(partial: Partial<DiscountEntity>) {
        super();
        Object.assign(this, partial);
    }
}