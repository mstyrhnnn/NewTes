import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { LedgersEntity } from './entities/ledger.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LedgerCategoriesEntity } from './entities/ledger-categories.entity';
import { GetLedgerFleetDto } from './dto/get-ledger-fleet.dto';
import { UserRoleEnum } from '../users/enums/user.role.enum.ts';
import { PaginationHelper } from 'src/config/helper/pagination/pagination.helper';
import { GetLedgerRecapDto } from './dto/get-ledger-recap.dto';
import { OrderEntity } from '../orders/entities/orders.entity';
import { getLedgerStatusFromPaymentStatus, LedgerStatus } from './enums/ledger-status.enum';
import { FleetsEntity } from '../fleets/entities/fleet.entity';
import { GetLedgerCategoriesDto } from './dto/get-ledger-categories.dto';
import { PriceHelper } from 'src/config/helper/price/price.helper';

@Injectable()
export class LedgersService {

  constructor(
    @InjectRepository(LedgersEntity) private ledgersRepository: Repository<LedgersEntity>,
    @InjectRepository(LedgerCategoriesEntity) private ledgerCategoriesRepository: Repository<LedgerCategoriesEntity>,
    @InjectRepository(FleetsEntity) private fleetsRepository: Repository<FleetsEntity>,
  ) { }

  async create(dto: CreateLedgerDto) {
    if (dto.category_id === 1 || dto.category_id === 2) {
      throw new UnprocessableEntityException('Cannot create automated ledger');
    } else if (dto.status === LedgerStatus.PENDING || dto.status === LedgerStatus.PARTIALLY_PAID || dto.status === LedgerStatus.DONE) {
      throw new UnprocessableEntityException('Cannot create ledger with this status');
    }

    // Create a new category if it doesn't exist
    let categoryId = await this.createCategoryIfNotExist(dto);

    return this.ledgersRepository.save(new LedgersEntity({
      fleet_id: dto.fleet_id,
      category_id: categoryId,
      date: dto.date,
      credit_amount: dto.credit_amount,
      debit_amount: dto.debit_amount,
      status: dto.status,
      description: dto.description,
    }));
  }

  private async createCategoryIfNotExist(dto: Partial<CreateLedgerDto>) {
    let categoryId = dto.category_id;
    if (dto.category) {
      const category = await this.createCategory(dto.category);
      categoryId = category.id;
    }
    return categoryId;
  }

  private async createCategory(category: string) {
    return this.ledgerCategoriesRepository.save(new LedgerCategoriesEntity({ name: category }));
  }

  async findRecap(user, dto: GetLedgerRecapDto) {
    const builder = this.ledgersRepository.createQueryBuilder('l')
      .withDeleted()
      .innerJoinAndSelect('l.fleet', 'fleet')
      .innerJoinAndSelect('l.category', 'category')
      .leftJoinAndSelect('l.user', 'user')
      .leftJoin('l.order', 'order')
      .addSelect('order.id')
      .addSelect('order.discount')
      .andWhere('fleet.owner_id = :ownerId', { ownerId: user.id })
      .andWhere('l.deleted_at IS NULL')
      .orderBy('l.date', 'DESC');

    if (dto.status) {
      builder.andWhere('order.status = :status', { status: dto.status });
    }

    if (dto.month && dto.year) {
      builder.andWhere(`EXTRACT(MONTH FROM (l.date AT TIME ZONE 'Asia/Jakarta')) = :month`, { month: dto.month })
        .andWhere(`EXTRACT(YEAR FROM (l.date AT TIME ZONE 'Asia/Jakarta')) = :year`, { year: dto.year })
    }

    if (dto.start_date && dto.end_date) {
      builder.andWhere('l.date BETWEEN :start_date AND :end_date', { start_date: dto.start_date, end_date: dto.end_date });
    }

    if (dto.q) {
      builder.andWhere('fleet.name ILIKE :q OR category.name ILIKE :q', { q: `%${dto.q}%` });
    }

    const items = await builder.getMany();
    return {
      items,
      total: {
        credit: items.reduce((acc, item) => acc + item.credit_amount, 0),
        debit: items.reduce((acc, item) => acc + item.debit_amount, 0),
        duration: items.reduce((acc, item) => acc + item.duration, 0),
        owner_comission: items.reduce((acc, item) => acc + (item.owner_commission ?? item.debit_amount ?? (item.credit_amount * -1)), 0),
      }
    }
  }

  async findFleetsRecap(user, dto: GetLedgerRecapDto) {
    const fleets = await this.fleetsRepository.find({ where: { owner_id: user.id } });

    const results = await Promise.all(fleets.map(async (fleet) => {
      const builder = this.ledgersRepository.createQueryBuilder('l')
        .withDeleted()
        .innerJoinAndSelect('l.fleet', 'fleet', 'fleet.id = :fleetId', { fleetId: fleet.id })
        .innerJoinAndSelect('l.category', 'category')
        .leftJoin('l.order', 'order')
        .andWhere('l.deleted_at IS NULL')
        .orderBy('l.date', 'DESC');

      if (dto.status) {
        builder.andWhere('order.status = :status', { status: dto.status });
      }

      const items = await builder.getMany();
      const owner_commission = items.reduce((acc, item) => acc + (item.owner_commission ?? item.debit_amount ?? (item.credit_amount * -1)), 0);

      return { fleet, owner_commission };
    }));

    return {
      items: results,
      total: {
        owner_comission: results.reduce((acc, item) => acc + item.owner_commission, 0),
      }
    };
  }

  async findFleetRecap(user, fleetId: number, dto: GetLedgerFleetDto) {
    const builder = this.ledgersRepository.createQueryBuilder('l')
      .withDeleted()
      .innerJoinAndSelect('l.fleet', 'fleet', 'fleet.id = :fleetId', { fleetId })
      .innerJoinAndSelect('l.category', 'category')
      .leftJoinAndSelect('l.user', 'user')
      .andWhere('l.deleted_at IS NULL')
      .andWhere('l.category_id NOT IN (1, 2)')
      .orderBy('l.date', 'DESC');

    if (user.role == UserRoleEnum.OWNER) {
      builder.andWhere('fleet.owner_id = :ownerId', { ownerId: user.id });
    }

    return PaginationHelper.pagination(builder, { page: dto.page, limit: dto.limit });
  }

  async update(id: number, dto: UpdateLedgerDto) {
    const ledger = await this.ledgersRepository.createQueryBuilder('l')
      .where('l.id = :id', { id })
      .addSelect('l.category_id')
      .getOne();

    if (!ledger) {
      throw new NotFoundException('Ledger not found');
    } else if (ledger.category_id == 1 || ledger.category_id == 2) {
      throw new Error('Cannot update automated ledger');
    }

    const categoryId = await this.createCategoryIfNotExist(dto);
    return this.ledgersRepository.update(id, {
      fleet_id: dto.fleet_id,
      category_id: categoryId,
      date: dto.date,
      credit_amount: dto.credit_amount,
      debit_amount: dto.debit_amount,
      status: dto.status,
      description: dto.description,
    });
  }

  async remove(id: number) {
    const ledger = await this.ledgersRepository.findOneBy({ id });
    if (!ledger) {
      throw new NotFoundException('Ledger not found');
    } else if (ledger.category_id == 1 || ledger.category_id == 2) {
      throw new Error('Cannot delete automated ledger');
    }

    return this.ledgersRepository.softDelete(id);
  }

  async createByOrder(order: OrderEntity, fleet: FleetsEntity) {
    order.setVirtualColumn();

    const ledgerParam = {
      order_id: order.id,
      date: order.start_date,
      duration: order.duration,
      fleet_id: fleet.id,
      status: getLedgerStatusFromPaymentStatus(order.payment_status),
      user_id: order.customer_id,
    };

    const ledger = new LedgersEntity({
      ...ledgerParam,
      debit_amount: PriceHelper.calculateDiscountedPrice(fleet.price, order.discount),
      category_id: 1,
      description: `Sewa ${fleet.type_label}`,
    });

    if (order.is_out_of_town) {
      const outOfTownLedger = new LedgersEntity({
        ...ledgerParam,
        debit_amount: PriceHelper.calculateDiscountedPrice(order.out_of_town_price, order.discount),
        category_id: 2,
        duration: null,
        description: `Luar Kota ${fleet.type_label}`,
      });

      await this.ledgersRepository.save(outOfTownLedger);
    }

    return this.ledgersRepository.save(ledger);
  }

  async updateByOrder(order: OrderEntity, fleet: FleetsEntity) {
    const orderLedger = await this.ledgersRepository.findOne({ where: { order_id: order.id, category_id: 1 } });
    if (!orderLedger) {
      throw new UnprocessableEntityException('Order ledger not found');
    }

    orderLedger.debit_amount = PriceHelper.calculateDiscountedPrice(fleet.price * order.duration, order.discount);
    orderLedger.status = getLedgerStatusFromPaymentStatus(order.payment_status);
    orderLedger.date = order.start_date;
    orderLedger.duration = order.duration;
    orderLedger.fleet_id = fleet.id;
    orderLedger.user_id = order.customer.id;
    orderLedger.description = `Sewa ${fleet.type_label}`;

    if (order.is_out_of_town) {
      const outOfTownLedger = await this.ledgersRepository.findOne({ where: { order_id: order.id, category_id: 2 } });
      if (outOfTownLedger) {
        outOfTownLedger.debit_amount = PriceHelper.calculateDiscountedPrice(order.out_of_town_price, order.discount);
        outOfTownLedger.status = orderLedger.status;
        outOfTownLedger.date = orderLedger.date;
        outOfTownLedger.fleet_id = orderLedger.fleet_id;
        outOfTownLedger.user_id = orderLedger.user_id;
        outOfTownLedger.description = `Luar Kota ${fleet.type_label}`;

        await this.ledgersRepository.save(outOfTownLedger);
      }
    }

    return this.ledgersRepository.save(orderLedger);
  }

  async removeByOrderId(orderId: number) {
    const orderLedger = await this.ledgersRepository.findOne({ where: { order_id: orderId, category_id: 1 } });
    if (orderLedger) {
      await this.ledgersRepository.softDelete(orderLedger.id);
    }

    const outOfTownLedger = await this.ledgersRepository.findOne({ where: { order_id: orderId, category_id: 2 } });
    if (outOfTownLedger) {
      await this.ledgersRepository.softDelete(outOfTownLedger.id);
    }
  }

  async getCategories(dto: GetLedgerCategoriesDto) {
    const builder = this.ledgerCategoriesRepository.createQueryBuilder('c')
      .andWhere('c.id NOT IN (1, 2)');

    if (dto.q) {
      builder.andWhere('c.name ILIKE :q', { q: `%${dto.q}%` });
    }

    return PaginationHelper.pagination(builder, { page: dto.page, limit: dto.limit });
  }
}
