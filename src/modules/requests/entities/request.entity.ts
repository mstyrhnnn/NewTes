import { AfterLoad, Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Base } from "../../../common/database/base.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { FleetsEntity } from "../../fleets/entities/fleet.entity";
import { RequestTypeEnum } from "../enums/request.type.enum";
import { RequestStatusEnum } from "../enums/request.status.enum";
import { RequestLogsEntity } from "./request-log.entity";
import { IsBoolean, IsInt, IsOptional } from "class-validator";
import { RequestLogsTypeEnum } from "../enums/request-logs.type.enum";
import { OrderEntity } from "../../orders/entities/orders.entity";

@Entity({
    name: 'requests',
})
export class RequestsEntity extends Base {

    @ManyToOne(() => OrderEntity)
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;

    @Column({ select: false, nullable: true })
    order_id: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'driver_id' })
    driver: UserEntity;

    @Column({
        select: false,
        nullable: true,
    })
    driver_id: number;

    /**
     * @deprecated Use order entity instead
     */
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'customer_id' })
    customer: UserEntity;

    /**
     * @deprecated Use order entity instead
     */
    @Column({
        select: false,
        nullable: true,
    })
    customer_id: number;

    /**
     * @deprecated Use order entity instead
     */
    @ManyToOne(() => FleetsEntity)
    @JoinColumn({ name: 'fleet_id' })
    fleet: FleetsEntity;

    /**
     * @deprecated Use order entity instead
     */
    @Column({
        select: false,
        nullable: true,
    })
    fleet_id: number;

    /**
     * @deprecated Use order entity instead
     */
    @Column({
        type: 'timestamptz',
        nullable: true,
    })
    start_date: Date;

    @Column({
        type: 'enum',
        enum: RequestTypeEnum,
    })
    type: string;

    @Column({
        type: 'enum',
        enum: RequestStatusEnum,
        default: RequestStatusEnum.PENDING,
    })
    status: string;

    @Column({ type: 'bool', default: false })
    is_self_pickup: boolean;

    /**
     * @deprecated Use order entity instead
     */
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    address: string;

    @Column({
        type: 'double precision',
        nullable: true,
    })
    distance: number;

    @OneToMany(() => RequestLogsEntity, o => o.request)
    logs: RequestLogsEntity[];

    @IsBoolean()
    @IsOptional()
    is_end_process: boolean;

    @IsInt()
    @IsOptional()
    progress_duration_second?: number;

    @IsOptional()
    related_requests?: RequestsEntity[];

    @AfterLoad()
    setVirtualColumns() {
        this.is_end_process = this.status === RequestStatusEnum.ON_PROGRESS || this.is_self_pickup;

        this.setDuration();
        this.handleDeprecatedData();
    }

    private handleDeprecatedData() {
        if (this.order) {
            this.customer = this.order.customer;
            this.customer_id = this.order.customer_id;
            this.fleet = this.order.fleet;
            this.fleet_id = this.order.fleet_id;
            this.description = this.order.description;

            this.setStartDateOrder();
        }
    }

    private setStartDateOrder() {
        this.start_date = this.order.start_date;

        if (this.type === RequestTypeEnum.PICK_UP) {
            this.start_date = this.order.end_date;
        } else if (this.type === RequestTypeEnum.DELIVERY) {
            this.start_date = this.order.start_date;
        }
    }

    private setDuration() {
        if (!this.logs || this.status === RequestStatusEnum.PENDING || this.logs.length === 0) {
            this.progress_duration_second = null;
            return;
        }

        const start = this.logs.find(o => o.type === RequestLogsTypeEnum.START);
        const end = this.logs.find(o => o.type === RequestLogsTypeEnum.END);

        if (!start) {
            this.progress_duration_second = null;
            return;
        }

        if (!end) {
            this.progress_duration_second = Math.floor((new Date().getTime() - start.created_at.getTime()) / 1000);
            return;
        }

        this.progress_duration_second = Math.floor((end.created_at.getTime() - start.created_at.getTime()) / 1000);
    }

    constructor(partial: Partial<RequestsEntity>) {
        super();
        Object.assign(this, partial);
    }
}