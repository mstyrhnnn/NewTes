import { AfterInsert, AfterLoad, Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Base } from "../../../common/database/base.entity";
import { FleetTypeEnum, getFleetTypeLabel } from "../enums/fleet.type.enum";
import { FleetPhotosEntity } from "./fleet-photo.entity";
import { LocationEntity } from "../../locations/entities/location.entity";
import { OrderEntity } from "../../orders/entities/orders.entity";
import { IsOptional } from "class-validator";
import { FleetComission } from "../model/fleet-comission.model";
import { UserEntity } from "../../users/entities/user.entity";
import { DiscountEntity } from "src/modules/discount/entities/discount.entity";

@Entity({
    name: 'fleets',
})
export class FleetsEntity extends Base {

    @Column({
        unique: true,
        nullable: false,
    })
    slug: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: FleetTypeEnum,
    })
    type: FleetTypeEnum;

    @Column({
        nullable: true,
    })
    color: string;

    @Column()
    plate_number: string;

    @OneToMany(() => FleetPhotosEntity, o => o.fleet, { cascade: ['insert'] })
    photos: FleetPhotosEntity[];

    @Column({
        type: 'double precision',
        nullable: true,
    })
    price: number;

    @Column({
        type: 'jsonb',
        default: new FleetComission({ transgo: null, owner: null, partner: null }),
    })
    commission: FleetComission;

    @ManyToOne(() => LocationEntity)
    @JoinColumn({ name: 'location_id' })
    location: LocationEntity;

    @Column({ select: false, nullable: true })
    location_id: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'owner_id' })
    owner: UserEntity;

    @Column({ select: false, nullable: true })
    owner_id: number;

    @OneToMany(() => OrderEntity, o => o.fleet)
    orders: OrderEntity[];

    @IsOptional()
    type_label: string;

    discount: number;

    @AfterLoad()
    @AfterInsert()
    afterLoad() {
        this.setTypeLabel();
    }

    private setTypeLabel() {
        this.type_label = getFleetTypeLabel(this.type);
    }

    constructor(partial: Partial<FleetsEntity>) {
        super();
        Object.assign(this, partial);
    }
}