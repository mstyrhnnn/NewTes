import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Base } from "../../../common/database/base.entity";
import { RequestLogsEntity } from "./request-log.entity";

@Entity({
    name: 'request_log_photos',
})
export class RequestLogPhotosEntity extends Base {

    @ManyToOne(() => RequestLogsEntity)
    @JoinColumn({ name: 'log_id' })
    log: RequestLogsEntity;

    @Column({ select: false, nullable: true })
    log_id: string

    @Column()
    photo: string;

    constructor(partial: Partial<RequestLogPhotosEntity>) {
        super();
        Object.assign(this, partial);
    }
}