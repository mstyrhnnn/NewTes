import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Base } from "../../../common/database/base.entity";
import { UserEntity } from "./user.entity";

@Entity({
    name: 'user_id_cards',
})
export class UserIdCards extends Base {

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column({ select: false, nullable: true })
    user_id: number;

    @Column()
    photo: string;

    @Column({ name: 'upload_batch' })
    upload_batch: string
    constructor(partial: Partial<UserIdCards>) {
        super();
        Object.assign(this, partial);
    }
}