import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import * as dayjs from 'dayjs';
import 'dayjs/locale/id';
import { FleetMitra } from '../fleets_mitra/entities/fleet_mitra.entity';
import { UserEntity } from '../users/entities/user.entity';
import { QontakService } from '../qontak/qontak.service';
import { QONTAK_WA_BLAS_PARTNER_DRIVER } from 'src/common/constant/qontak.constans';
import { SendWaRawDto } from './dto/send-wa-driver.dto';
import { SendWaDto } from './dto/send-wa.dto';
import { UserRoleEnum } from '../users/enums/user.role.enum.ts';

@Injectable()
export class WaBlasService {
  constructor(
    @InjectRepository(FleetMitra)
    private readonly fleetRepo: Repository<FleetMitra>,

    @InjectRepository(UserEntity) 
    private readonly userRepo: Repository<UserEntity>,

    private readonly qontakService: QontakService,
  ) {}

  async getFleetWithDrivers(): Promise<FleetMitra[]> {
    return this.fleetRepo.find({
      where: { driver_id: Not(IsNull()) },
      relations: ['driver'],
    });
  }

  async sendWaBlasByDto(dto: SendWaDto): Promise<{ status: string; message: string }> {
    const driver = await this.findDriverById(dto.driverId);

    if (!driver) {
      return {
        status: 'error',
        message: 'Driver tidak ditemukan',
      };
    }

    await this.sendWaBlasToDriver(
      driver,
      dto.saldo,
      dto.biaya_sewa,
      dto.jumlah_kekurangan,
      dto.jumlah_kelebihan,
    );

    return {
      status: 'success',
      message: 'WA berhasil dikirim ke driver',
    };
  }

  async bulkSendWaDriver(dataList: SendWaRawDto[]): Promise<{ success: boolean; total_request: number; total_sent: number; total_failed: number; failed_details: { name: string; phone: string; reason: string }[]; }> {

    const failed_details: { name: string; phone: string; reason: string }[] = [];
    let total_sent = 0;

    for (const data of dataList) {
      const driver = await this.findDriverById(data.driver_id);

      if (!driver) {
        const reason = `Driver dengan ID ${data.driver_id} tidak ditemukan`;
        failed_details.push({ name: 'Unknown', phone: '-', reason });
        continue;
      }

      try {
        await this.sendWaBlasToDriver(
          driver,
          data.saldo,
          data.biaya_sewa,
          data.jumlah_kekurangan,
          data.jumlah_kelebihan,
        );
        total_sent++;
      } catch (error: any) {
        // const reason = error.message || 'Nomor Whatsapp Tidak Valid';
        const reason = 'Nomor Whatsapp Tidak Valid';
        failed_details.push({
          name: driver.name,
          phone: driver.phone_number,
          reason,
        });
      }
    }

    return {
      success: failed_details.length === 0,
      total_request: dataList.length,
      total_sent,
      total_failed: failed_details.length,
      failed_details,
    };
  }

  private async sendWaBlasToDriver( driver: UserEntity, saldo?: string, biaya_sewa?: string, jumlah_kekurangan?: string, jumlah_kelebihan?: string,): Promise<void> {

    dayjs.locale('id');
    const formattedDate = dayjs().format('DD MMMM YYYY');

    console.log(`Mengirim WA ke Driver: ID ${driver.id}, Phone ${driver.phone_number}, Name ${driver.name}`);

    await this.qontakService.sendMessage({
      to: driver.phone_number,
      customerName: driver.name,
      message: QONTAK_WA_BLAS_PARTNER_DRIVER(
        driver.name,
        formattedDate,
        saldo,
        biaya_sewa,
        jumlah_kekurangan,
        jumlah_kelebihan,
      ),
    });
  }

  async findDriverById(driverId: number): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { id: driverId, role: UserRoleEnum.GOJEK },
    });
  }
}
