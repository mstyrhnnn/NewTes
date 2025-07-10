import { Base } from "../../../common/database/base.entity";
import { Column, Entity } from "typeorm";

@Entity('notification_types')
export class NotificationTypeEntity extends Base {

    @Column({ unique: true })
    key: string;

    @Column()
    text: string;

    setText(text: string) {
        this.text = text;
    }

    constructor(partial: Partial<NotificationTypeEntity>) {
        super();
        Object.assign(this, partial);
    }
}