import { Base } from "../../../common/database/base.entity";
import { FleetsEntity } from "../../fleets/entities/fleet.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { AfterLoad, Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { OrderPaymentStatusEnum } from "../enums/order.payment-status.enum";
import { InsuranceEntity } from "../../insurances/entities/insurances.entity";
import { IsNumber, IsOptional } from "class-validator";
import { RequestsEntity } from "../../requests/entities/request.entity";
import { OrderApprovalStatusEnum, OrderStatusEnum } from "../enums/order.status.enum";
import { OrderStatusLogsEntity } from "./order-status-logs.entity";
import { RequestTypeEnum } from "../../requests/enums/request.type.enum";
import { OrderRequestStatusEnum } from "../enums/order.request-status.enum";
import { RequestStatusEnum } from "src/modules/requests/enums/request.status.enum";
import { UserStatusEnum } from "../../users/enums/user.status.enum";
import { OrderAdditionalItems } from "../interface/order-additionals.interface";
import { RequestLogsTypeEnum } from "src/modules/requests/enums/request-logs.type.enum";

@Entity({
    name: 'orders',
})
export class OrderEntity extends Base {

    @Column()
    invoice_number: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ManyToOne(() => FleetsEntity)
    @JoinColumn({ name: 'fleet_id' })
    fleet: FleetsEntity;

    @Column({ select: false })
    fleet_id: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'customer_id' })
    customer: UserEntity;

    @Column({ select: true })
    customer_id: number;

    @Column({
        type: 'timestamptz'
    })
    start_date: Date;

    @Column({
        type: 'int',
    })
    duration: number;

    @Column({
        type: 'enum',
        enum: OrderPaymentStatusEnum,
        default: OrderPaymentStatusEnum.PENDING,
    })
    payment_status: OrderPaymentStatusEnum;

    @Column({
        type: 'enum',
        enum: OrderApprovalStatusEnum,
        default: OrderApprovalStatusEnum.PENDING,
    })
    status: OrderApprovalStatusEnum;

    @ManyToOne(() => InsuranceEntity)
    @JoinColumn({ name: 'insurance_id' })
    insurance: InsuranceEntity;

    @Column({ select: false, nullable: true })
    insurance_id: number;

    @OneToMany(() => OrderStatusLogsEntity, log => log.order, { cascade: ['insert'] })
    status_logs: OrderStatusLogsEntity[];

    @Column({
        type: 'double precision',
        nullable: true,
    })
    service_price: number;

    @Column({
        type: 'double precision',
        nullable: true,
    })
    out_of_town_price: number;

    @Column({
        type: 'jsonb',
        nullable: true,
    })
    additional_services: OrderAdditionalItems[];

    @Column({
        type: 'double precision',
        nullable: true,
    })
    driver_price: number;

    @Column({
        type: 'double precision',
        default: 0,
    })
    sub_total_price: number;

    @Column({
        type: 'double precision',
        default: 0,
    })
    total_tax: number;

    /**
     * Discount in percentage
     */
    @Column({
        type: 'double precision',
        default: 0,
    })
    discount: number;

    @Column({
        type: 'double precision',
        default: 0,
    })
    total_price: number;

    @Column({
        type: 'text',
        nullable: true,
    })
    payment_link: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    payment_pdf_url: string;

    @Column({
        nullable: true,
    })
    external_id: string;

    @IsNumber()
    discount_amount: number;

    @IsOptional()
    end_date?: Date;

    @OneToMany(() => RequestsEntity, request => request.order, { cascade: ['insert'] })
    requests: RequestsEntity[];

    @IsOptional()
    start_request?: RequestsEntity;

    @IsOptional()
    end_request?: RequestsEntity;

    @IsOptional()
    request_status: OrderRequestStatusEnum;

    @IsOptional()
    is_out_of_town: boolean;

    @IsOptional()
    is_with_driver: boolean;

    @IsOptional()
    order_status: OrderStatusEnum;

    @IsOptional()
    order_status_text: string;

    @AfterLoad()
    setVirtualColumn() {
        this.discount_amount = this.sub_total_price * this.discount;

        this.setRequests();
        this.setRequestStatus();
        this.deleteRquests();

        this.setEndDate();

        this.setBooleanValues();
        this.setOrderStatus();
    }

    private setOrderStatus() {
        if (this.status == OrderApprovalStatusEnum.PENDING && this.customer?.status == UserStatusEnum.PENDING) {
            this.order_status = OrderStatusEnum.PENDING;
            this.order_status_text = 'Menunggu Persetujuan';
        } else if (this.status == OrderApprovalStatusEnum.PENDING) {
            this.order_status = OrderStatusEnum.WAITING;
            this.order_status_text = 'Terkonfirmasi & Menunggu PIC';
        } else if (this.status == OrderApprovalStatusEnum.ACCEPTED && this.start_request?.status == RequestStatusEnum.PENDING) {
            this.order_status = OrderStatusEnum.CONFIRMED;
            this.order_status_text = 'Terkonfirmasi';
        } else if (this.status == OrderApprovalStatusEnum.ACCEPTED && (this.start_request?.status == RequestStatusEnum.ON_PROGRESS || this.end_request?.status == RequestStatusEnum.PENDING || this.end_request?.status == RequestStatusEnum.ON_PROGRESS)) {
            this.order_status = OrderStatusEnum.ON_GOING;
            this.order_status_text = 'Sedang Berjalan';
        } else if (this.status == OrderApprovalStatusEnum.ACCEPTED && this.end_request?.status == RequestStatusEnum.DONE) {
            this.order_status = OrderStatusEnum.DONE;
            this.order_status_text = 'Selesai';
        } else if (this.status == OrderApprovalStatusEnum.REJECTED){
            this.order_status_text = 'Ditolak Admin';
        }
    }

    private setBooleanValues() {
        this.is_out_of_town = (this.out_of_town_price ?? 0) > 0;
        this.is_with_driver = (this.driver_price ?? 0) > 0;
    }

    private setRequests() {
        if (!this.requests || this.requests.length === 0) {
            this.start_request = null;
            this.end_request = null;
            return;
        }

        this.start_request = this.requests.find(r => r.type === RequestTypeEnum.DELIVERY);
        this.end_request = this.requests.find(r => r.type === RequestTypeEnum.PICK_UP);
    }

    private setRequestStatus() {
        if (!this.requests || this.requests.length === 0) {
            this.request_status = OrderRequestStatusEnum.PENDING;
            return;
        }

        const isPending = this.requests.some(r => r.status === RequestStatusEnum.PENDING || r.status === RequestStatusEnum.ON_PROGRESS);
        const isDone = this.requests.every(r => r.status === RequestStatusEnum.DONE);

        if (isPending) {
            this.request_status = OrderRequestStatusEnum.PENDING;
        } else if (isDone) {
            this.request_status = OrderRequestStatusEnum.DONE;
        } else {
            this.request_status = OrderRequestStatusEnum.PENDING;
        }
    }

    private deleteRquests() {
        delete this.requests;
    }

    private setEndDate() {
        if (this.start_date && this.duration) {
            const endDate = new Date(this.start_date);
            endDate.setDate(endDate.getDate() + this.duration);
            this.end_date = endDate;
        }

        // TODO: if the end request is still on progress and it's over the end date, then set the end date to this date

        // If the end request is done, then set the end date to the end request date
        if (this.end_request && this.end_request?.logs && this.end_request?.status === RequestStatusEnum.DONE) {
            this.end_date = this.end_request?.logs?.find(l => l.type === RequestLogsTypeEnum.END)?.created_at ?? this.end_date;
        }
    }

    constructor(partial: Partial<OrderEntity>) {
        super();
        Object.assign(this, partial);
    }
}
