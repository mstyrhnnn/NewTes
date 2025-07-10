import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Base } from "../../../common/database/base.entity";
import { RequestsEntity } from "./request.entity";
import { RequestLogsTypeEnum } from "../enums/request-logs.type.enum";
import { RequestLogPhotosEntity } from "./request-log-photo.entity";

@Entity({
    name: 'request_logs',
})
export class RequestLogsEntity extends Base {

    @ManyToOne(() => RequestsEntity)
    @JoinColumn({ name: 'request_id' })
    request: RequestsEntity;

    @Column({ select: false, nullable: true })
    request_id: number

    @Column({
        type: 'enum',
        enum: RequestLogsTypeEnum,
    })
    type: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    pdf_tnc: string;

    @OneToMany(() => RequestLogPhotosEntity, o => o.log, { cascade: ['insert'] })
    photos: RequestLogPhotosEntity[];

    constructor(partial: Partial<RequestLogsEntity>) {
        super();
        Object.assign(this, partial);
    }
}