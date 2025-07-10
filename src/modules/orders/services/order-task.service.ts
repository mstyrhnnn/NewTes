import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderEntity } from "../entities/orders.entity";
import { Repository } from "typeorm";
import { OrderApprovalStatusEnum } from "../enums/order.status.enum";
import { OrderPaymentStatusEnum } from "../enums/order.payment-status.enum";
import { FleetsEntity } from "src/modules/fleets/entities/fleet.entity";
import { UserEntity } from "src/modules/users/entities/user.entity";
import { QontakService } from "src/modules/qontak/qontak.service";
import { QONTAK_AFTER_SEWA, QONTAK_BEFORE_SEWA } from "src/common/constant/qontak.constans";
import { DateHelper } from "src/config/helper/date/date.helper";

@Injectable()
export class OrderTaskService {
    constructor(
        @InjectRepository(OrderEntity) private orderRepository: Repository<OrderEntity>,
        @InjectRepository(FleetsEntity) private fleetRepository: Repository<FleetsEntity>,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        private qontakService: QontakService,
    ) { }

    private async qontakBeforeSewa(fromDate: Date, toDate: Date) {
        const builder = this.orderRepository.createQueryBuilder('o')
            .innerJoinAndSelect('o.fleet', 'f')
            .innerJoinAndSelect('o.customer', 'c')
            .where('o.start_date >= :fromDate', { fromDate })
            .andWhere('o.start_date <= :toDate', { toDate })
            .andWhere('o.status = :status', { status: OrderApprovalStatusEnum.ACCEPTED })
            .andWhere('o.payment_status IN (:...paymentStatus)', { paymentStatus: [OrderPaymentStatusEnum.PARTIALLY_PAID, OrderPaymentStatusEnum.DONE] })
            .andWhere('o.deleted_at IS NULL');

        const data = await builder.getMany();

        data.map((order) => {
            const orderDetail = `${order.customer.name} dengan unit ${order.fleet.name} pada tanggal ${DateHelper.getJakartaMoment(order.start_date.toISOString()).format('DD MMMM YYYY')}`;

            this.qontakService.sendMessage({
                to: order.customer.phone_number,
                customerName: order.customer.name,
                message: QONTAK_BEFORE_SEWA(
                    orderDetail,
                    DateHelper.getJakartaMoment(order.start_date.toISOString()).format('HH:mm'),
                )
            })
        })
    }

    private async qontakAfterSewa() {
        const builder = this.orderRepository.createQueryBuilder('o')
            .innerJoinAndSelect('o.fleet', 'f')
            .innerJoinAndSelect('o.customer', 'c')
            .where(`o.start_date + (o.duration || 'DAY')::interval >= NOW() + INTERVAL '2 HOURS'`)
            .andWhere(`o.start_date + (o.duration || 'DAY')::interval <= NOW() + INTERVAL '2 HOURS 1 MINUTE'`)
            .andWhere('o.status = :status', { status: OrderApprovalStatusEnum.ACCEPTED })
            .andWhere('o.payment_status IN (:...paymentStatus)', { paymentStatus: [OrderPaymentStatusEnum.PARTIALLY_PAID, OrderPaymentStatusEnum.DONE] })
            .andWhere('o.deleted_at IS NULL');

        const data = await builder.getMany();

        data.map((order) => {
            const orderDetail = `dengan unit ${order.fleet.name} pada tanggal ${DateHelper.getJakartaMoment(order.start_date.toISOString()).format('DD MMMM YYYY')}`;

            this.qontakService.sendMessage({
                to: order.customer.phone_number,
                customerName: order.customer.name,
                message: QONTAK_AFTER_SEWA(
                    order.customer.name,
                    orderDetail,
                    DateHelper.getJakartaMoment(order.start_date.toISOString()).format('HH:mm'),
                )
            })
        })
    }

    @Cron("1 * * * * *")
    handleTask() {
        this.qontakBeforeSewa(
            new Date(Date.now() + 2 * 60 * 60 * 1000),
            new Date(Date.now() + 2 * 60 * 60 * 1000 + 1 * 60 * 1000)
        );
        this.qontakAfterSewa();
    }
}