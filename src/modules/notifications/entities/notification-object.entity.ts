import { RequestsEntity } from "../../requests/entities/request.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { NotificationTypeEntity } from "./notification-type.entity";
import { Base } from "../../../common/database/base.entity";

@Entity('notification_objects')
export class NotificationObjectEntity extends Base {

    @ManyToOne(() => NotificationTypeEntity, { nullable: false })
    @JoinColumn({ name: 'type_id' })
    type: NotificationTypeEntity;

    @Column({ select: false })
    type_id: number;

    /* ---Resources--- */

    @ManyToOne(() => RequestsEntity, { nullable: true })
    @JoinColumn({ name: 'request_id' })
    request: RequestsEntity;

    @Column({ select: false, nullable: true })
    request_id: number;

    constructor(partial: Partial<NotificationObjectEntity>) {
        super();
        Object.assign(this, partial);
    }
}