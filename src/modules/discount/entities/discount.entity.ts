import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Base } from "../../../common/database/base.entity";
import { LocationEntity } from "src/modules/locations/entities/location.entity";
import { FleetTypeEnum } from "../../fleets/enums/fleet.type.enum";

@Entity({
    name: 'fleet_discount',
})
export class DiscountEntity extends Base {

    @Column()
    discount: number;

    @Column()
    location_id: number;

    @Column({
        type: 'enum',
        enum: FleetTypeEnum,
    })

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    constructor(partial: Partial<DiscountEntity>) {
        super();
        Object.assign(this, partial);
    }
}