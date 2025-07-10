import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusserEntity, BusserStatusEnum } from './busser.entity';
import { OrderEntity } from '../orders/entities/orders.entity';
import { OrderApprovalStatusEnum } from '../orders/enums/order.status.enum';

@Injectable()
export class BusserService {
  constructor(
    @InjectRepository(BusserEntity)
    private readonly busserRepository: Repository<BusserEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  /**
   * Metode ini akan dijalankan oleh cron job setiap hari
   * untuk memeriksa dan memperbarui status busser.
   */
  async checkAndUpdateStatuses(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set ke awal hari untuk perbandingan yang konsisten

    // Ambil semua order yang aktif dan belum selesai atau ditolak
    const orders = await this.orderRepository.find({
      where: {
        status: OrderApprovalStatusEnum.ACCEPTED,
      },
      relations: ['busser', 'unit'], // PASTIKAN relasi 'unit' dimuat
    });

    for (const order of orders) {
      // HITUNG TANGGAL KEMBALI dari start_date dan duration
      const returnDate = new Date(order.start_date);
      returnDate.setDate(returnDate.getDate() + order.duration);
      returnDate.setHours(0, 0, 0, 0);
      
      // Lewati jika order belum melewati tanggal pengembalian
      if (today <= returnDate) {
        continue;
      }

      // Hitung jumlah hari keterlambatan
      const daysLate = Math.floor((today.getTime() - returnDate.getTime()) / (1000 * 3600 * 24));

      if (daysLate <= 0) {
        continue;
      }
      
      let newStatus: BusserStatusEnum;

      if (daysLate >= 3) {
        newStatus = BusserStatusEnum.URGENT;
      } else if (daysLate >= 2) {
        newStatus = BusserStatusEnum.BUTUH_TINDAKAN;
      } else {
        newStatus = BusserStatusEnum.PERINGATAN;
      }

      let busser = await this.busserRepository.findOne({ where: { order: { id: order.id } } });

      if (busser && (busser.status === BusserStatusEnum.TINDAK_LANJUT || busser.status === BusserStatusEnum.SELESAI)) {
        continue;
      }
      
      if (!busser) {
        busser = this.busserRepository.create({ order });
      }

      if (busser.status !== newStatus) {
        busser.status = newStatus;
        busser.status_updated_at = new Date();
        await this.busserRepository.save(busser);
      }
    }
  }

  /**
   * Mengambil semua data busser berdasarkan status.
   */
  async getBussersByStatus(status: BusserStatusEnum): Promise<BusserEntity[]> {
    return this.busserRepository.find({
      where: { status },
      relations: ['order', 'order.customer', 'order.unit'], // Sertakan data lengkap untuk frontend
    });
  }

  /**
   * Menghitung total biaya keterlambatan.
   * Pastikan order yang di-pass sudah memuat relasi 'unit'.
   */
  calculateLateFee(order: OrderEntity, daysLate: number): number {
    if (!order.fleet) {
      // Tambahkan penanganan jika relasi unit tidak dimuat
      throw new Error(`Unit relation for Order ID ${order.id} is not loaded.`);
    }
    const dailyRate = order.fleet.price; 
    return daysLate * dailyRate;
  }
  
  /**
   * Untuk investigator mengambil tugas/bounty.
   */
  async assignTask(busserId: number, investigatorId: number): Promise<BusserEntity> {
    const busser = await this.busserRepository.findOne({ where: { id: busserId } });
    if (!busser || busser.status !== BusserStatusEnum.URGENT) {
      throw new NotFoundException(`Busser dengan ID ${busserId} tidak ditemukan atau tidak berstatus URGENT.`);
    }

    busser.status = BusserStatusEnum.TINDAK_LANJUT;
    busser.investigator_id = investigatorId;
    busser.status_updated_at = new Date();
    
    return this.busserRepository.save(busser);
  }

  /**
   * Menyelesaikan kasus busser.
   */
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