import { Column, Entity } from "typeorm";
import { Base } from "../../../common/database/base.entity";

@Entity({
    name: 'locations',
})
export class LocationEntity extends Base {

    @Column()
    name: string;

    @Column({
        default: '',
    })
    location: string;

    @Column({
        type: 'text',
        default: '',
    })
    address: string;

    @Column({
        type: 'text',
        default: '',
    })
    map_url: string;

    @Column({
        type: 'text',
        default: '',
    })
    redirect_url: string;

    constructor(partial: Partial<LocationEntity>) {
        super();
        Object.assign(this, partial);
    }
}