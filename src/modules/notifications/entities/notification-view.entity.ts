import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { NotificationEntity } from "./notification.entity";
import { Base } from "../../../common/database/base.entity";
import { UserEntity } from "../../users/entities/user.entity";

@Entity('notification_views')
export class NotificationViewEntity extends Base {

    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column({ select: false, nullable: true })
    user_id: number;

    @ManyToOne(() => NotificationEntity, { nullable: false })
    @JoinColumn({ name: 'notification_id' })
    notification: NotificationEntity;

    @Column({ select: false, nullable: false })
    notification_id: number;

    constructor(partial: Partial<NotificationViewEntity>) {
        super();
        Object.assign(this, partial);
    }
}