import { Base } from "../../../common/database/base.entity";
import { AfterLoad, BeforeInsert, Column, Entity, Index, OneToMany } from "typeorm";
import { UserGenderEnum } from "../enums/user.gender.enum";
import { UserRoleEnum } from "../enums/user.role.enum";
import { USER_EMAIL_UNIQUE_INDEX } from "src/common/constant/db-index.key.constant";
import { UserIdCards } from "./user-id-cards.entity";
import { UserStatusEnum } from "../enums/user.status.enum";
import { PhoneNumberHelper } from "../../../config/helper/string/phone-number.helper";
import { UserStatusDataEnum } from "../enums/user.status-data.enum";

@Entity({
    name: 'users',
})
export class UserEntity extends Base {

    @Column()
    name: string;

    @Column({ nullable: true, select: false })
    @Index(USER_EMAIL_UNIQUE_INDEX, { unique: true, where: 'deleted_at IS NULL' })
    email: string;

    @Column({ nullable: true })
    phone_number?: string;

    @Column({
        nullable: true,
        type: 'enum',
        enum: UserRoleEnum,
    })
    role: string;

    @Column({
        nullable: true,
        type: 'enum',
        enum: UserGenderEnum,
        select: false
    })
    gender?: string;

    @Column({
        nullable: true,
        type: 'date',
        select: false
    })
    date_of_birth?: Date;

    @Column({ nullable: true, select: false })
    password: string;

    @Column({ nullable: true, select: false })
    nik: string;

    @Column({ nullable: true, select: false })
    photo_profile: string;

    @Column({ nullable: true, select: false })
    emergency_phone_number?: string;

    @OneToMany(() => UserIdCards, u => u.user, { cascade: ['insert'] })
    id_cards?: UserIdCards[];

    @Column({
        type: 'enum',
        enum: UserStatusEnum,
        default: UserStatusEnum.PENDING,
    })
    status: UserStatusEnum;

    @Column({
        nullable: true,
        select: false,
    })
    paper_id?: string;

    @Column({
        nullable: true,
        select: false,
    })
    paper_number?: string;

    @Column({
        nullable: false,
        type: 'enum',
        enum: UserStatusDataEnum.NOT_REQUIRED,
    })
    additional_data_status: UserStatusDataEnum;
    additional_data?: UserIdCards[];

    @Column({ type: 'boolean', default: true })
    status_login: boolean;

    @AfterLoad()
    afterLoad() {
        if (this.id_cards) {
            const idCardsWithNullUploadBatch = this.id_cards.filter(card => card.upload_batch === null);
            const idCardsWithNonNullUploadBatch = this.id_cards.filter(card => card.upload_batch !== null);
            this.id_cards = idCardsWithNullUploadBatch;
            this.additional_data = idCardsWithNonNullUploadBatch;
        }

        if (this.phone_number) {
            this.phone_number = PhoneNumberHelper.replacePrefix(this.phone_number);
        }
    }

    @BeforeInsert()
    beforeInsert() {
        if (this.email) {
            this.email = this.email.toLowerCase().trim();
        }
        if (this.name) {
            this.name = this.name.trim();
        }
    }

    constructor(partial: Partial<UserEntity>) {
        super();
        Object.assign(this, partial);
    }
}
