import { AfterLoad, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Base } from "../../../common/database/base.entity";
import { FleetsEntity } from "../../fleets/entities/fleet.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { OrderEntity } from "../../orders/entities/orders.entity";
import { LedgerStatus } from "../enums/ledger-status.enum";
import { isGeneratedCategory, LedgerCategoriesEntity } from "./ledger-categories.entity";
import { IsOptional } from "class-validator";

@Entity({
    name: 'ledgers',
})
export class LedgersEntity extends Base {

    constructor(partial: Partial<LedgersEntity>) {
        super();
        Object.assign(this, partial);
    }

    /** FLEET */
    @ManyToOne(() => FleetsEntity)
    @JoinColumn({ name: 'fleet_id' })
    fleet: FleetsEntity;

    @Column({ select: false })
    fleet_id: number;

    /** CATEGORY */
    @ManyToOne(() => LedgerCategoriesEntity)
    @JoinColumn({ name: 'category_id' })
    category: LedgerCategoriesEntity;

    @Column({ select: false })
    category_id: number;

    /** CREATOR */
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column({ select: false, nullable: true })
    user_id: number;

    /** ORDER */
    @ManyToOne(() => OrderEntity)
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;

    @Column({ select: false, nullable: true })
    order_id: number;

    @Column({
        type: 'timestamptz',
    })
    date: Date;

    @Column({
        type: 'int',
        nullable: true,
    })
    duration: number;

    @Column({
        type: 'double precision',
        nullable: true,
    })
    credit_amount: number;

    @Column({
        type: 'double precision',
        nullable: true,
    })
    debit_amount: number;

    @Column({
        enum: LedgerStatus,
        default: LedgerStatus.PENDING,
    })
    status: LedgerStatus;

    @Column({
        nullable: true,
    })
    description: string;

    /** Virtual Column */
    @IsOptional()
    owner_commission: number;

    @IsOptional()
    end_date: Date;

    @AfterLoad()
    afterLoad() {
        this.setComission();
        this.setEndDate();
    }

    setEndDate() {
        if (!this.date || !this.duration) return;

        const endDate = new Date(this.date);
        endDate.setDate(endDate.getDate() + this.duration);
        this.end_date = endDate;
    }

    private setComission() {
        if (this.fleet) {
            if (this.debit_amount != null) {
                if (isGeneratedCategory(this.category) && this.fleet.commission.owner != null) {
                    this.owner_commission = this.debit_amount * this.fleet.commission.owner / 100;
                } else if (this.fleet.commission.owner == null) {
                    this.owner_commission = this.debit_amount;
                }
            }
        }
    }
}
