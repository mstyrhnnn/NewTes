import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Base } from "../../../common/database/base.entity";
import { FleetsEntity } from "./fleet.entity";

@Entity({
    name: 'fleet_photos',
})
export class FleetPhotosEntity extends Base {

    @ManyToOne(() => FleetsEntity)
    @JoinColumn({ name: 'fleet_id' })
    fleet: FleetsEntity;

    @Column({ select: false, nullable: true })
    fleet_id: number;

    @Column()
    photo: string;

    constructor(partial: Partial<FleetPhotosEntity>) {
        super();
        Object.assign(this, partial);
    }
}