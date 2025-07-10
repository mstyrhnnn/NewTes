import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { QONTAK_SERVICE_REMINDER_MESSAGE } from 'src/common/constant/qontak.constans';
import { FleetsEntity } from 'src/modules/fleets/entities/fleet.entity';
import { QontakService } from 'src/modules/qontak/qontak.service';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ServiceReminderService {
    constructor(
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @InjectRepository(FleetsEntity) private fleetRepository: Repository<FleetsEntity>,
        private qontakService: QontakService,
    ) {}

    private async getOwnerUsers() {
        return this.userRepository.find({
            where: {
                role: 'owner',
            },
        });
    }

    private async getFleetbyOwner(ownerId: number) {
        return this.fleetRepository.find({
            where: {
                owner_id: ownerId,
            },
        });
    }

    private async sendReminderMessage() {
        try {
            const users = await this.getOwnerUsers();
            await Promise.all(users.map(async (user) => {
                const fleets = await this.getFleetbyOwner(user.id);
                return Promise.all(fleets.map(async (fleet) => {
                    try {
                        await this.qontakService.sendMessage({
                            to: user.phone_number,
                            customerName: user.name,
                            message: QONTAK_SERVICE_REMINDER_MESSAGE(
                                user.name,
                                fleet.type,
                                fleet.name,
                                fleet.plate_number
                            )
                        });
                    } catch (error) {
                        console.error(`Error sending message for fleet ${fleet.name} to ${user.phone_number}:`, error);
                    }
                }));
            }));
        } catch (error) {
            console.error('Error in sendReminderMessage:', error);
        }
    }

    @Cron("0 0 1 * *", { name: 'service-reminder-task', timeZone: 'Asia/Jakarta' })
    async handleTReminderask() {
        await this.sendReminderMessage();
    }
}
