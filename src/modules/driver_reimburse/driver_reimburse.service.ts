import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  Admin,
  SelectQueryBuilder,
} from 'typeorm';
import { DriverReimburse } from './entities/driver-reimburse.entity';
import { CreateDriverReimburseDto } from './dto/create-driver-reimburse.dto';
import { ReimburseStatus } from './enums/reimburse-status.enum';
import { UserRoleEnum } from '../users/enums/user.role.enum.ts';
import { StoragesService } from '../storages/storages.service';
import { FleetsService } from '../fleets/fleets.service';
import { REIMBURSE_CACHE_COUNT_KEY } from 'src/common/constant/cache.key.constant';
import { REIMBURSE_CACHE_TTL } from 'src/common/constant/cache.ttl.constant';

@Injectable()
export class DriverReimburseService {
  constructor(
    @InjectRepository(DriverReimburse)
    private readonly reimburseRepo: Repository<DriverReimburse>,
    private readonly fleetsService: FleetsService,
    private storageServie: StoragesService,
  ) {}

  async findAll(filters?: {
    status?: ReimburseStatus;
    startDate?: Date;
    endDate?: Date;
    driverId?: number;
    page?: number;
    limit?: number;
  }) {
    const query = this.reimburseRepo
      .createQueryBuilder('reimburse')
      .leftJoinAndSelect('reimburse.driver', 'driver')
      .leftJoinAndSelect('reimburse.fleet', 'fleet')
      .leftJoinAndSelect('reimburse.location', 'location');

    if (filters?.status) {
      query.andWhere('reimburse.status = :status', { status: filters.status });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere({
        date: Between(filters.startDate, filters.endDate),
      });
    } else if (filters?.startDate) {
      query.andWhere({ date: MoreThanOrEqual(filters.startDate) });
    } else if (filters?.endDate) {
      query.andWhere({ date: LessThanOrEqual(filters.endDate) });
    }

    if (filters?.driverId) {
      query.andWhere('reimburse.driver_id = :driverId', {
        driverId: filters.driverId,
      });
    }

    return query.orderBy('reimburse.created_at', 'DESC').getMany();
  }

  async create(createDto: CreateDriverReimburseDto, userId: number) {
    let transactionProofUrl = null;

    if (!createDto.bank) {
      throw new BadRequestException('Bank tidak boleh kosong');
    }

    if (createDto.fleet_id) {
      const fleet = await this.fleetsService.findOne(
        createDto.fleet_id.toString(),
      );
      if (!fleet) {
        throw new BadRequestException('Fleet tidak valid');
      }
    }

    const newReimburse = this.reimburseRepo.create({
      ...createDto,
      bank: createDto.bank,
      driver: { id: createDto.driver_id },
      location: { id: createDto.location_id },
      fleet: createDto.fleet_id ? { id: createDto.fleet_id } : null,
      transactionProofUrl: createDto.transaction_proof_url,
    });

    return this.reimburseRepo.save(newReimburse);
  }

  async findOne(id: number, user?: UserRoleEnum) {
    const reimburse = await this.reimburseRepo.findOne({
      where: { id },
      relations: ['driver', 'location', 'fleet'],
    });

    if (!reimburse) {
      throw new NotFoundException('Reimbursement not found');
    }

    return reimburse;
  }

  async updateStatus(
    id: number,
    status: ReimburseStatus,
    userRole: UserRoleEnum,
    rejection_reason?: string,
    req_user_sub?: number,
  ) {
    if (!id || isNaN(id)) {
      throw new BadRequestException('invalid id: id must be a valid number');
    }

    if (userRole !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException('Only admin can update status');
    }

    const allowedTransitions = {
      [ReimburseStatus.PENDING]: [
        ReimburseStatus.CONFIRMED,
        ReimburseStatus.REJECTED,
      ],
      [ReimburseStatus.CONFIRMED]: [ReimburseStatus.DONE],
      [ReimburseStatus.REJECTED]: [ReimburseStatus.DONE],
    };

    const reimburse = await this.reimburseRepo.findOne({ where: { id } });
    if (!reimburse) {
      throw new NotFoundException('Reimbursement not found');
    }

    const currentStatus = reimburse.status;

    if (!allowedTransitions[currentStatus].includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${status}`,
      );
    }

    const updateData: Partial<DriverReimburse> = {
      status,
      ...(status === ReimburseStatus.REJECTED && {
        rejection_reason: rejection_reason ?? null,
        rejected_at: new Date(),
      }),
    };

    await this.reimburseRepo.update(id, updateData);
    return this.findOne(id);
  }

  private handleStatusFilter(
    builder: SelectQueryBuilder<DriverReimburse>,
    status: ReimburseStatus,
  ) {
    switch (status) {
      case ReimburseStatus.PENDING:
        builder.andWhere(`(reimburse.status = '${ReimburseStatus.PENDING}')`);
        break;
      case ReimburseStatus.CONFIRMED:
        builder.andWhere(`(reimburse.status = '${ReimburseStatus.CONFIRMED}')`);
        break;
      case ReimburseStatus.DONE:
        builder.andWhere(`(reimburse.status = '${ReimburseStatus.CONFIRMED}')`);
        break;
    }

    return builder;
  }

  // async getStatusCount() {
  //   return this.reimburseRepo
  //     .createQueryBuilder('reimburse')
  //     .select('reimburse.status', 'status')
  //     .addSelect('COUNT(reimburse.id)', 'count')
  //     .groupBy('reimburse.status')
  //     .getRawMany();
  // }

  private getStatusCountByStatus(status: ReimburseStatus) {
    const builder = this.reimburseRepo
      .createQueryBuilder('reimburse')
      .select('COUNT(reimburse.id)', 'count');

    return this.handleStatusFilter(builder, status)
      .select('COUNT(reimburse.id)', 'count')
      .cache(REIMBURSE_CACHE_COUNT_KEY(status), REIMBURSE_CACHE_TTL)
      .getRawOne();
  }

  async getStatusCount() {
    const pendingStatus = await this.getStatusCountByStatus(
      ReimburseStatus.PENDING,
    );
    const confirmedStatus = await this.getStatusCountByStatus(
      ReimburseStatus.CONFIRMED,
    );
    const doneStatus = await this.getStatusCountByStatus(ReimburseStatus.DONE);

    return [
      {
        status: ReimburseStatus.PENDING,
        count: pendingStatus == null ? 0 : +pendingStatus?.count,
      },
      {
        status: ReimburseStatus.CONFIRMED,
        count: confirmedStatus == null ? 0 : +confirmedStatus?.count,
      },
      {
        status: ReimburseStatus.DONE,
        count: doneStatus == null ? 0 : +doneStatus?.count,
      },
    ];
  }

  async remove(id: number) {
    const reimburse = await this.findOne(id);

    return this.reimburseRepo.remove(reimburse);
  }
}
