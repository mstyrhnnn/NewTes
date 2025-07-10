import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BusserService } from '../../busser/busser.service';

@Injectable()
export class BusserTaskService {
  constructor(private readonly busserService: BusserService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    await this.busserService.checkAndUpdateStatuses();
  }
}