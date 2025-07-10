import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import * as dayjs from 'dayjs';
import { UserStatusEnum } from 'src/modules/users/enums/user.status.enum';

@Injectable()
export class LoginStatusCronService {
    private readonly logger = new Logger(LoginStatusCronService.name);

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    @Cron('0 * * * *', { name: 'update-status-login-for-rejected-users', timeZone: 'Asia/Jakarta' })
    // @Cron('* * * * *', { name: 'update-status-login-for-rejected-users', timeZone: 'Asia/Jakarta' })
    async handleUpdateStatusLogin() {
        this.logger.log('Running cron job: update-status-login-for-rejected-users');

        const threshold = dayjs().subtract(72, 'hour').toDate();

        try {
            const result = await this.userRepository
                .createQueryBuilder()
                .update(UserEntity)
                .set({ status_login: false }) 
                .where('status = :status', { status: UserStatusEnum.REJECTED })
                .andWhere('deleted_at IS NOT NULL')
                .andWhere('deleted_at <= :threshold', { threshold })
                .andWhere('status_login = :currentStatus', { currentStatus: true })
                .execute();

            this.logger.log(`Updated ${result.affected} user(s) to status_login = false`);
        } catch (error) {
            this.logger.error('Error running update-status-login cron job', error);
        }
    }
}
