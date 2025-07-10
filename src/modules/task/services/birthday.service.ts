import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QontakService } from 'src/modules/qontak/qontak.service';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Raw, Repository } from 'typeorm';
import { QONTAK_BIRTHDAY_DISCOUNT_MESSAGE } from "src/common/constant/qontak.constans";
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BirthdayService {
    constructor(
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        private qontakService: QontakService,
    ) {}

    private async getBirthdayUsers() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        return this.userRepository.find({
            where: {
                date_of_birth: Raw(
                    (alias) => `EXTRACT(MONTH FROM ${alias}) = ${month} AND EXTRACT(DAY FROM ${alias}) = ${day}`,
                ),
            },
        });
    }

    private async sendBirthdayMessage() {
        const users = await this.getBirthdayUsers();
        users.map((user) => {
            this.qontakService.sendMessage({
                to: user.phone_number,
                customerName: user.name,
                message: QONTAK_BIRTHDAY_DISCOUNT_MESSAGE(
                    user.name,
                )
            })
        });
    }

    @Cron('0 0 * * *', { name: 'send-birthday-message', timeZone: 'Asia/Jakarta' })
    async handleCron() {
        await this.sendBirthdayMessage();
    }
}