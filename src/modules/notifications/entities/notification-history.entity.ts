import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
  } from 'typeorm';
import { UserEntity } from "../../users/entities/user.entity";
import { Base } from "../../../common/database/base.entity";

@Entity('notification_history')
export class NotificationHistoryEntity extends Base {

    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column({ name: 'user_id', type: 'bigint', nullable: true })
    userId: number | null;
  
    @Column({ name: 'order_id', type: 'bigint', nullable: true })
    orderId: number | null;
  
    @Column({ name: 'type_key', type: 'varchar', nullable: true })
    typeKey: string | null;
  
    @ManyToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    constructor(partial: Partial<NotificationHistoryEntity>) {
        super();
        Object.assign(this, partial);
    }
}