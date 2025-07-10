import { Injectable, Logger, NotFoundException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusserEntity} from './busser.entity';
import { OrderEntity } from '../orders/entities/orders.entity';
import { OrderApprovalStatusEnum } from '../orders/enums/order.status.enum';
import { BusserDetailsDto } from './dto/busser-details.dto';
import { BusserStatusEnum } from './enums/busser.status.enum'; 

@Injectable()
export class BusserService {
  private readonly logger = new Logger(BusserService.name);

  constructor(
    @InjectRepository(BusserEntity)
    private readonly busserRepository: Repository<BusserEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async checkAndUpdateStatuses(): Promise<void> {
    this.logger.log('Mulai menjalankan checkAndUpdateStatuses...');
    
    const orders = await this.orderRepository.find({
      where: { status: OrderApprovalStatusEnum.ACCEPTED },
      relations: ['busser', 'fleet'],
    });

    this.logger.log(`Menemukan ${orders.length} order dengan status ACCEPTED.`);

    if (orders.length === 0) {
        this.logger.warn('Tidak ada order yang perlu diproses. Pastikan data uji Anda memiliki status "ACCEPTED".');
        return;
    }

    for (const order of orders) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const returnDate = new Date(order.start_date);
      returnDate.setDate(returnDate.getDate() + order.duration);
      returnDate.setHours(0, 0, 0, 0);

      const daysLate = Math.floor((today.getTime() - returnDate.getTime()) / (1000 * 3600 * 24));

      this.logger.log(`Memeriksa Order ID: ${order.id}. Tanggal Kembali: ${returnDate.toDateString()}. Hari ini: ${today.toDateString()}. Telat: ${daysLate} hari.`);

      if (daysLate <= 0) {
        this.logger.log(`Order ID: ${order.id} tidak telat. Melewati...`);
        continue;
      }
      
      let newStatus: BusserStatusEnum;
      if (daysLate >= 3) newStatus = BusserStatusEnum.URGENT;
      else if (daysLate >= 2) newStatus = BusserStatusEnum.BUTUH_TINDAKAN;
      else newStatus = BusserStatusEnum.PERINGATAN;
      
      this.logger.log(`Order ID: ${order.id} seharusnya mendapatkan status: ${newStatus}.`);

      let busser = await this.busserRepository.findOne({ where: { order: { id: order.id } } });

      if (busser && (busser.status === BusserStatusEnum.TINDAK_LANJUT || busser.status === BusserStatusEnum.SELESAI)) {
        this.logger.log(`Order ID: ${order.id} sudah berstatus ${busser.status}. Melewati...`);
        continue;
      }
      
      if (!busser) {
        this.logger.log(`Membuat entitas Busser baru untuk Order ID: ${order.id}.`);
        busser = this.busserRepository.create({ order });
      }

      if (busser.status !== newStatus) {
        busser.status = newStatus;
        busser.status_updated_at = new Date();
        await this.busserRepository.save(busser);
        this.logger.log(`Berhasil menyimpan status ${newStatus} untuk Order ID: ${order.id}.`);
      } else {
         this.logger.log(`Status untuk Order ID: ${order.id} sudah ${newStatus}. Tidak ada perubahan.`);
      }
    }
     this.logger.log('Selesai menjalankan checkAndUpdateStatuses.');
  }


  async getBussersByStatus(status: BusserStatusEnum): Promise<BusserDetailsDto[]> {
    const bussers = await this.busserRepository.find({
      where: { status },
      relations: {
        order: {
          customer: true,
          fleet: true,
        },
      },
    });

    const bussersWithDetails: BusserDetailsDto[] = bussers.map(busser => {
      if (!busser.order || !busser.order.fleet) {
        this.logger.warn(`Melewati Order ID: ${busser.order?.id} karena data fleet tidak lengkap.`);
        return {
          ...busser,
          days_late: 0,
          late_fee_total: 0,
        };
      }

      const today = new Date();
      const returnDate = new Date(busser.order.start_date);
      returnDate.setDate(returnDate.getDate() + busser.order.duration);

      const daysLate = Math.floor((today.getTime() - returnDate.getTime()) / (1000 * 3600 * 24));
      const lateFee = this.calculateLateFee(busser.order, daysLate);

      return {
        ...busser,
        days_late: daysLate,
        late_fee_total: lateFee,
      };
    });

    return bussersWithDetails;
  }


  calculateLateFee(order: OrderEntity, daysLate: number): number {
    if (!order.fleet) {
      throw new Error(`Fleet relation for Order ID ${order.id} is not loaded.`);
    }
    const dailyRate = order.fleet.price; 
    return daysLate * dailyRate;
  }
  
  async assignTask(busserId: number, investigatorId: number): Promise<BusserDetailsDto> {
    const busser = await this.busserRepository.findOne({ where: { id: busserId } });
    if (!busser || busser.status !== BusserStatusEnum.URGENT) {
      throw new NotFoundException(`Busser dengan ID ${busserId} tidak ditemukan atau tidak berstatus URGENT.`);
    }

    busser.status = BusserStatusEnum.TINDAK_LANJUT;
    busser.investigator_id = investigatorId;
    await this.busserRepository.save(busser);

    const updatedBusser = await this.busserRepository.findOne({
      where: { id: busserId },
      // PERBAIKAN DI SINI: Gunakan format objek yang andal
      relations: {
        order: {
          customer: true,
          fleet: true,
        },
      },
    });

    if (!updatedBusser.order || !updatedBusser.order.fleet) {
        this.logger.warn(`Data fleet untuk Order ID: ${updatedBusser.order?.id} tidak lengkap saat mengambil tugas.`);
        return {
            ...updatedBusser,
            days_late: 0,
            late_fee_total: 0,
        };
    }

    const today = new Date();
    const returnDate = new Date(updatedBusser.order.start_date);
    returnDate.setDate(returnDate.getDate() + updatedBusser.order.duration);
    const daysLate = Math.floor((today.getTime() - returnDate.getTime()) / (1000 * 3600 * 24));
    const lateFee = this.calculateLateFee(updatedBusser.order, daysLate);

    return { ...updatedBusser, days_late: daysLate, late_fee_total: lateFee };
}

  async resolveBusser(busserId: number, notes: string): Promise<BusserEntity> {
    const busser = await this.busserRepository.findOne({ where: { id: busserId } });
     if (!busser) {
      throw new NotFoundException(`Busser dengan ID ${busserId} tidak ditemukan.`);
    }
    
    busser.status = BusserStatusEnum.SELESAI;
    busser.notes = notes;
    busser.status_updated_at = new Date();
    
    return this.busserRepository.save(busser);
  }
}