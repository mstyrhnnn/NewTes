import { AfterLoad, Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { NotificationObjectEntity } from "./notification-object.entity";
import { NotificationViewEntity } from "./notification-view.entity";
import { Base } from "../../../common/database/base.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { IsBoolean, IsOptional } from "class-validator";
import { replaceRequestTypeText } from "../../../modules/requests/enums/request.type.enum";

@Entity('notifications')
export class NotificationEntity extends Base {

    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: 'notifier_id' })
    notifier: UserEntity;

    @Column({ select: false, nullable: true })
    notifier_id: number;

    @ManyToOne(() => NotificationObjectEntity, { nullable: false })
    @JoinColumn({ name: 'object_id' })
    object: NotificationObjectEntity;

    @Column({ select: false, nullable: false })
    object_id: number;

    @OneToOne(() => NotificationViewEntity, view => view.notification)
    view: NotificationViewEntity;

    @IsBoolean()
    @IsOptional()
    is_viewed: boolean;

    @AfterLoad()
    setIsViewed() {
        this.is_viewed = this.view ? !!this.view : false;

        this.setTextAppend();
    }

    private setTextAppend() {
        if ((this.object?.type?.key === 'request.create' || this.object?.type?.key === 'request.update')) {
            this.object?.type?.setText(replaceRequestTypeText(this.object?.type?.text, this.object?.request?.type, this.object?.request?.is_self_pickup));
        }
    }

    constructor(partial: Partial<NotificationEntity>) {
        super();
        Object.assign(this, partial);
    }
}