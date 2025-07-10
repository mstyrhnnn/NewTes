import { Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { PasswordHashHelper } from '../../config/helper/hash/password-hash.helper';
import { PaginationHelper } from 'src/config/helper/pagination/pagination.helper';
import { QueryHelper } from 'src/config/helper/database/query_helper';
import { USER_EMAIL_UNIQUE_INDEX } from 'src/common/constant/db-index.key.constant';
import { UserIdCards } from './entities/user-id-cards.entity';
import { UserStatusEnum } from './enums/user.status.enum';

import { MailService } from '../mail/mail.service';
import { CREATED_USER_MESSAGE, NEED_OTHER_DATA, REJECTED_USER_MESSAGE, VERIFIED_USER_MESSAGE, VERIFIED_USER_SUPPORT_TEXT } from 'src/common/constant/mail.message.constant';

import { QontakService } from '../qontak/qontak.service';
import { QONTAK_ACCEPTED_ORDER_USER, QONTAK_ACCOUNT_ACTIVE, QONTAK_AFTER_SEWA, QONTAK_BEFORE_SEWA, QONTAK_CANCEL_ORDER, QONTAK_CREATED_USER_MESSAGE, QONTAK_FORGOT_PASSWORD, QONTAK_REJECTED_ORDER, QONTAK_REJECTED_USER_MESSAGE, QONTAK_VERIFICATION_ACCOUNT, QONTAK_VERIFICATION_WITH_ADDITIONAL_DATA,  } from 'src/common/constant/qontak.constans';

import { UserRoleEnum } from './enums/user.role.enum.ts';
import { USER_CACHE_COUNT_KEY } from 'src/common/constant/cache.key.constant';
import { USER_CACHE_TTL } from 'src/common/constant/cache.ttl.constant';
import { UserTokenEntity } from './entities/user-token.entity';
import { UserTokenReason } from './enums/user.token-reason.enum';
import { TokenHelper } from 'src/config/helper/string/token.helper';
import { PhoneNumberHelper } from 'src/config/helper/string/phone-number.helper';
import { PaperHelper } from 'src/common/payment/paper/paper.helper';
import { CreatePartnerParam } from 'src/common/payment/paper/param/create-partner.param';
import { UserStatusDataEnum } from './enums/user.status-data.enum';
import { AdminComment } from './entities/admin-comment.entity';
import * as moment from 'moment';
import { AdditionalDataDto } from './entities/additional-data.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(UserIdCards) private readonly userIdCardsRepository: Repository<UserIdCards>,
        @InjectRepository(UserTokenEntity) private readonly userTokenRepository: Repository<UserTokenEntity>,
        @InjectRepository(AdminComment) private readonly adminCommentRepository: Repository<AdminComment>,
        private readonly mailService: MailService,
        private readonly qontakService: QontakService,
    ) { }

    async get(page: number, limit: number, role: string, q?: string, isFull?: boolean, status?: UserStatusEnum, statusadditionaldata?: UserStatusDataEnum) {
        const builder = this.userRepository.createQueryBuilder('u')
            .where('u.role = :role', { role })
            .orderBy('u.id', 'DESC');

        if (q && q !== '') {
            builder.andWhere('LOWER(u.name) LIKE LOWER(:q)', { q: `%${q}%` });
        }

        if (isFull) {
            this.appendUserFullSelect(builder);
        }

        if (status) {
            builder.andWhere('u.status = :status', { status });
        }

        if (statusadditionaldata) {
            builder.andWhere('u.additional_data_status = :statusadditionaldata', { statusadditionaldata });
        }

        return PaginationHelper.pagination(builder, { page, limit });
    }

    async findOne(id: number, isFull?: boolean): Promise<UserEntity> {
        if (!id) {
            throw new NotFoundException('ID is required.');
        }

        const builder = this.userRepository.createQueryBuilder('u')
            .withDeleted()
            .where('u.id = :id', { id });

        if (isFull) {
            this.appendUserFullSelect(builder);
            builder.addSelect('u.deleted_at');
        }

        return builder.getOne();
    }

    private appendUserFullSelect(builder) {
        QueryHelper.appendSelect(builder, [
            'u.gender',
            'u.email',
            'u.phone_number',
            'u.emergency_phone_number',
            'u.date_of_birth',
            'u.nik',
            'u.photo_profile',
            'u.paper_number',
            'u.paper_id',
        ]);

        builder.leftJoinAndSelect('u.id_cards', 'id_cards');
    }

    async validateUser(email: string, currentPassword: string, role?: UserRoleEnum | UserRoleEnum[]) {
        const builder = this.userRepository
            .createQueryBuilder('u')
            .withDeleted()
            .where('u.email = :email', { email })
            .andWhere('u.status_login = :statusLogin', { statusLogin: true }) 
            .addSelect('u.password');

        if (role) {
            if (Array.isArray(role)) {
                builder.andWhere('u.role IN (:...role)', { role });
            } else {
                builder.andWhere('u.role = :role', { role });
            }
        }

        this.appendUserFullSelect(builder);

        const user = await builder.getOne();

        if (!user) {
            throw new NotFoundException('Akun Tidak Ditemukan');
        }

        const isPasswordCorrect = await PasswordHashHelper.comparePassword(currentPassword, user.password);
        if (!isPasswordCorrect) {
            throw new NotFoundException('Password Salah Silahkan Lakukan Lupa Password');
        }

        // if (user.status !== UserStatusEnum.VERIFIED) {
        //     throw new UnprocessableEntityException('User is not verified.');
        // }

        const { password, ...result } = user;
        return result;
    }


    private catchUniqueIndexError(err) {
        const constraint = err?.driverError?.constraint;

        if (constraint === USER_EMAIL_UNIQUE_INDEX) {
            throw new UnprocessableEntityException({
                message: 'Email Telah Digunakan',
                error: 'Unprocessable Entity',
                statusCode: 422,
                code: 'user_email_unique',
            });
        } else {
            throw new UnprocessableEntityException(err);
        }
    }

    async create(user: UserEntity, updateToPaper: boolean = false) {
        try {
            const newUser = await this.userRepository.save({
                ...user,
                phone_number: user.phone_number ? PhoneNumberHelper.replacePrefix(user.phone_number) : undefined,
                password: user.password ? await PasswordHashHelper.hash(user.password) : undefined,
            });

            if (updateToPaper) {
                const partnerPaper = await this.createPaperPartner(newUser);
                user.paper_number = partnerPaper.number;
                user.paper_id = partnerPaper.id;
            }

            if (newUser.status === UserStatusEnum.PENDING) {
                this.mailService.sendMail({
                    to: newUser.email,
                    subject: 'Registrasi Akun Pelanggan Transgo Anda Telah Dilakukan!',
                    customerName: newUser.name,
                    message: CREATED_USER_MESSAGE,
                });

                this.qontakService.sendMessage({
                    to: newUser.phone_number,
                    customerName: newUser.name,
                    message: QONTAK_CREATED_USER_MESSAGE,
                })
            } else if (newUser.status === UserStatusEnum.VERIFIED) {
                this.sendVerificationMail(newUser);
            }

            this.clearUserCountCache(user.role);

            return newUser;
        } catch (error) {
            this.catchUniqueIndexError(error);
        }
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.userRepository.findOne({
            where: { email },
            withDeleted: true, 
            order: { created_at: 'DESC' },
            select: ['id', 'email', 'deleted_at', 'status', 'status_login'], 
        });
    }

    private async sendVerificationMail(user: UserEntity) {
        const token = await this.createToken(user, UserTokenReason.CHANGE_PASSWORD);

        await this.mailService.sendMail({
            to: user.email,
            subject: 'Akun Pelanggan Transgo Anda Telah Dibuat!',
            customerName: user.name,
            message: VERIFIED_USER_MESSAGE,
            // buttonLink: `${process.env.FRONTEND_URL}/atur-password?token=${token.token}`,
            // buttonName: 'Atur Kata Sandi',
            // customSupportText: VERIFIED_USER_SUPPORT_TEXT,
        });

        if (![UserRoleEnum.DRIVER.toString(), UserRoleEnum.OWNER.toString()].includes(user.role)) {
            await this.qontakService.sendMessage({
                to: user.phone_number,
                customerName: user.name,
                message: QONTAK_ACCOUNT_ACTIVE
                // message: QONTAK_VERIFIED_USER_MESSAGE(
                //     `${process.env.FRONTEND_URL}/atur-password?token=${token.token}`
                // ),
            });
        }
    }

    async update(id: number, dto: UserEntity, idCards: string[] = undefined, updateToPaper: boolean = false) {
        const user = await this.findOne(id, true);
        delete user.id_cards;

        user.name = dto.name?.replace(/\s+$/, '');
        user.email = dto.email
        user.role = dto.role
        user.gender = dto.gender
        user.date_of_birth = dto.date_of_birth
        user.nik = dto.nik
        user.photo_profile = dto.photo_profile
        user.emergency_phone_number = dto.emergency_phone_number

        if (dto.phone_number) {
            user.phone_number = PhoneNumberHelper.replacePrefix(dto.phone_number);
        }

        if (dto.password) {
            user.password = await PasswordHashHelper.hash(dto.password);
        }

        if (idCards) {
            await this.userIdCardsRepository.createQueryBuilder()
                .where('user_id = :id', { id })
                .softDelete()
                .execute();

            await this.userIdCardsRepository
                .save(idCards?.map(idCard => new UserIdCards({ photo: idCard, user_id: id })));
        }

        if (updateToPaper && user.paper_id) {
            const paper = await this.updatePaperPartner(user.paper_id, user.paper_number, user);
            user.paper_number = paper.number;
        }

        return user.save();
    }

    async remove(id: number) {
        return this.userRepository.softDelete({ id });
    }

    async checkUserRole(id: number, role: string) {
        const builder = this.userRepository
            .createQueryBuilder('u')
            .where('u.id = :id', { id })
            .andWhere('u.role = :role', { role });

        const user = await builder.getOne();
        return !!user;
    }

    async isUserVerified(id: number) {
        const builder = this.userRepository
            .createQueryBuilder('u')
            .where('u.id = :id', { id })
            .andWhere('u.status = :status', { status: UserStatusEnum.VERIFIED });

        const user = await builder.getOne();
        return !!user;
    }


    async verifyUser(id: number, reason?: string) {
        const user = await this.findOne(id, true);
        // if (user.status === UserStatusEnum.VERIFIED) {
        //     throw new UnprocessableEntityException('User already verified.');
        // }

        const updateData = {
            status: UserStatusEnum.VERIFIED,
            additional_data_status: reason
                ? UserStatusDataEnum.REQUIRED
                : UserStatusDataEnum.NOT_REQUIRED,
        };

        if (reason) {
            const timestamp = moment().format('YYYYMMDDHHmmss');
            const relatedUploadBatch = `${id}-${timestamp}`;

            await Promise.all([
            this.adminCommentRepository.save({
                user_id: id,
                message: reason,
                related_upload_batch: relatedUploadBatch,
            }),
            this.qontakService.sendMessage({
                to: user.phone_number,
                customerName: user.name,
                message: QONTAK_VERIFICATION_WITH_ADDITIONAL_DATA(reason),
            }),
            this.mailService.sendMail({
                to: user.email,
                subject: 'Akun Anda Perlu Verifikasi Tambahan',
                customerName: user.name,
                message: NEED_OTHER_DATA(reason),
            }),
        ]);

        } else {

        user.additional_data_status = UserStatusDataEnum.NOT_REQUIRED

        this.qontakService.sendMessage({
        to: user.phone_number,
        customerName: user.name,
        message: QONTAK_VERIFICATION_ACCOUNT,
        });

        this.sendVerificationMail(user);
        }

        await this.userRepository.update({ id }, updateData);

        this.clearUserCountCache(user.role);

        return {
            message: 'User verified successfully.',
        };
    }

    async rejectUser(id: number, reason: string) {
        const user = await this.findOne(id, true);

        // if (user.status === UserStatusEnum.REJECTED || user.status === UserStatusEnum.VERIFIED) {
        //     throw new UnprocessableEntityException('User already rejected or verified.');
        // }

        user.status = UserStatusEnum.REJECTED;
        user.additional_data_status = UserStatusDataEnum.NOT_REQUIRED;
        user.deleted_at = new Date();
        await user.save();

        this.mailService.sendMail({
            to: user.email,
            subject: 'Akun Pelanggan Transgo Anda Ditolak!',
            customerName: user.name,
            message: REJECTED_USER_MESSAGE(reason),
            hideSupport: true,
        });

        this.qontakService.sendMessage({
            to: user.phone_number,
            customerName: user.name,
            message: QONTAK_REJECTED_USER_MESSAGE(reason),
        });


        this.clearUserCountCache(user.role);

        return {
            message: 'User rejected & deleted successfully.',
        };
    }

    async getCommentatoryByUserId(userId: number) {

        const comments = await this.adminCommentRepository.find({
            where: { user_id: userId },
        });
        const cards = await this.userIdCardsRepository.find({
            where: { user_id: userId },
        });

        const results = comments.map(comment => {
            const matchingCards = cards.filter(card => card.upload_batch === comment.related_upload_batch)
            .map(card => card.photo);

            return {
                ...comment,
                items: matchingCards,
            };
        });

        return results;
    }

        async submitAdditionalData(userId: number, uploadBatch: string, dto: AdditionalDataDto) {
        const user = await this.findOne(userId);
        if (!user) throw new NotFoundException('User not found');

        const newIdCards = dto.id_cards.map(photo => new UserIdCards({
            photo,
            user,
            upload_batch: uploadBatch,
        }));

        await this.userIdCardsRepository.save(newIdCards);

        await this.userRepository.update(userId, {
            additional_data_status: UserStatusDataEnum.PENDING,
        });
        return {
            message: 'Additional data submitted successfully',
            data: {
            userId,
            status: 'pending',
            },
        };
    }

        async getVerificationIsNeeded(userId: number) {
        const user = await this.findOne(userId);
        if (!user) throw new NotFoundException('User not found');

        const statusUser = user.status;
        const additionalStatus = user.additional_data_status;

        if (statusUser === UserStatusEnum.PENDING && additionalStatus === UserStatusDataEnum.NOT_REQUIRED) {
            return {
                message: 'Data Anda Sedang Di Verifikasi',
                hexcolor: '#5C7285',
                need_verification: false,
                show_card: true
            };
        }

        if (statusUser === UserStatusEnum.VERIFIED && additionalStatus === UserStatusDataEnum.REQUIRED) {
            return {
                message: 'Anda Perlu Mengupload Data Tambahan Agar Akun Dapat Di Verifikasi Ulang',
                hexcolor: '#328E6E',
                need_verification: true,
                show_card: true
            };
        }

        if (statusUser === UserStatusEnum.VERIFIED && additionalStatus === UserStatusDataEnum.PENDING) {
            return {
                message: 'Data Tambahan Anda Sedang Di Verifikasi',
                hexcolor: '#309898',
                need_verification: false,
                show_card: true
            };
        }

        if (statusUser === UserStatusEnum.REJECTED) {
            return {
                message: 'Akun anda ditolak! Dalam 3 hari akun ini beserta data nya akan terhapus otomatis, dan anda tidak dapat memesan kendaraan kami, mohon maaf atas ketidaknyamanannya',
                hexcolor: '#B82132',
                need_verification: false,
                show_card: true
            };
        }

        return {
            message: 'Status tidak diketahui',
            hexcolor: '328E6E',
            need_verification: false,
            show_card: false
        };
    }



    async getStatusCount(role: UserRoleEnum) {
        const result = await this.userRepository
            .createQueryBuilder('u')
            .select('u.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .andWhere('u.role = :role', { role })
            .groupBy('status')
            .cache(USER_CACHE_COUNT_KEY(role), USER_CACHE_TTL)
            .getRawMany();

        const statuses = Object.values(UserStatusEnum);
        return statuses.map(status => {
            const data = result.find(r => r.status === status);
            return {
                status,
                count: data ? +data.count : 0,
            };
        });
    }

    async getAdditionalDataStatusCount(role: UserRoleEnum) {
    const result = await this.userRepository
        .createQueryBuilder('u')
        .select('u.additional_data_status', 'additional_data_status')
        .addSelect('COUNT(*)', 'count')
        .where('u.role = :role', { role })
        .groupBy('u.additional_data_status')
        .getRawMany();

    const statuses = Object.values(UserStatusDataEnum);

    return statuses.map(status => {
        const data = result.find(r => r.additional_data_status === status);
        return {
        status,
        count: data ? +data.count : 0,
        };
    });
    }



    

    async forgotPassword(email: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'name', 'phone_number'],
        });

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        const token = await this.createToken(user, UserTokenReason.FORGOT_PASSWORD);

        await this.mailService.sendMail({
            to: user.email,
            subject: 'Lupa Kata Sandi Akun Pelanggan Transgo Anda?',
            customerName: user.name,
            message: 'Klik tombol di bawah ini untuk mereset kata sandi akun pelanggan Transgo Anda.',
            buttonLink: `${process.env.FRONTEND_URL}/atur-password?token=${token.token}`,
            buttonName: 'Reset Kata Sandi',
        });
        
        await this.qontakService.sendMessage({
            to: user.phone_number,
            customerName: user.name,
            message: QONTAK_FORGOT_PASSWORD(`${process.env.FRONTEND_URL}/atur-password?token=${token.token}`)
          })

        return {
            message: 'Forgot password email sent successfully.',
        };
    }

    async createToken(user: UserEntity, reason: UserTokenReason) {
        const token = await this.userTokenRepository.save({
            user_id: user.id,
            token: TokenHelper.generateToken(14),
            expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Days
            reason,
        });

        return token;
    }

    async validateToken(token: string, reason: UserTokenReason | UserTokenReason[]) {
        const reasons = Array.isArray(reason) ? reason : [reason];

        const userToken = await this.userTokenRepository.createQueryBuilder('ut')
            .where('ut.token = :token', { token })
            .andWhere('ut.reason IN (:...reasons)', { reasons })
            .orderBy('ut.id', 'DESC')
            .innerJoinAndSelect('ut.user', 'u')
            .getOne();

        if (!userToken) {
            throw new NotFoundException('Token not found.');
        }

        if (userToken.expired_at < new Date()) {
            throw new UnprocessableEntityException('Token expired.');
        }

        return userToken;
    }

    async changePassword(token: string, newPassword: string) {
        const userToken = await this.validateToken(token, [
            UserTokenReason.CHANGE_PASSWORD,
            UserTokenReason.FORGOT_PASSWORD,
        ]);
        const user = userToken.user;

        user.password = await PasswordHashHelper.hash(newPassword);
        await user.save();

        await this.userTokenRepository.softDelete({ id: userToken.id });

        return {
            message: 'Password changed successfully.',
        };
    }

    private async clearUserCountCache(role: string) {
        return this.userRepository.manager.connection.queryResultCache.remove([USER_CACHE_COUNT_KEY(role)]);
    }

    async createPaperPartnerIfNotExist(userId: number) {
        const user = await this.findOne(userId, true);
        delete user.id_cards;

        if (!user.paper_id) {
            console.log('Creating paper partner for user', user.id);

            const partnerPaper = await this.createPaperPartner(user);
            user.paper_number = partnerPaper.number;
            user.paper_id = partnerPaper.id;
            return await user.save();
        }

        return user;
    }

    private async createPaperPartner(dto: Partial<{
        name: string;
        email: string;
        phone_number: string;
    }>) {
        const number = TokenHelper.generateTokenWithPrefix(new Date().getTime().toString(), 6);
        return PaperHelper.createPartner(new CreatePartnerParam({
            name: dto.name,
            number,
            email: dto.email,
            phone: dto.phone_number,
        }));
    }

    async updatePaperPartner(id: string, number: string, dto: Partial<{
        name: string;
        email: string;
        phone_number: string;
    }>) {
        if (!number) {
            number = TokenHelper.generateTokenWithPrefix(new Date().getTime().toString(), 6);
        }

        return PaperHelper.updatePartner(id, new CreatePartnerParam({
            name: dto.name,
            email: dto.email,
            phone: dto.phone_number,
            number,
        }));
    }

    async findByRole(id: number, role: string) {
        return this.userRepository.findOne({
            where: { id, role },
        });
    }

    
}
