import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateFleetDto } from './dto/create-fleet.dto';
import { UpdateFleetDto } from './dto/update-fleet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FleetsEntity } from './entities/fleet.entity';
import { Brackets, Repository } from 'typeorm';
import { GetFleetPaginationDto } from './dto/get-fleet-pagination.dto';
import { PaginationHelper } from 'src/config/helper/pagination/pagination.helper';
import { FleetPhotosEntity } from './entities/fleet-photo.entity';
import { GetFleetAvailabilityPaginationDto } from './dto/get-fleet-availability-pagination.dto';
import { DateHelper } from 'src/config/helper/date/date.helper';
import { RequestTypeEnum } from '../requests/enums/request.type.enum';
import { RequestStatusEnum } from '../requests/enums/request.status.enum';
import { SlugHelper } from 'src/config/helper/string/slug.helper';
import { GetFleetCalendarPaginationDto } from './dto/get-fleet-calendar-pagination.dto';
import { OrderApprovalStatusEnum } from '../orders/enums/order.status.enum';
import { FleetComission } from './model/fleet-comission.model';
import { UsersService } from '../users/users.service';
import { UserRoleEnum } from '../users/enums/user.role.enum';
import { DiscountService } from '../discount/discount.service';
import { DiscountEntity } from '../discount/entities/discount.entity';

@Injectable()
export class FleetsService {

  constructor(
    @InjectRepository(FleetsEntity) private readonly fleetsRepository: Repository<FleetsEntity>,
    @InjectRepository(FleetPhotosEntity) private readonly fleetPhotosRepository: Repository<FleetPhotosEntity>,
    private userSerivce: UsersService,
    private discountService: DiscountService,
  ) { }

  create(dto: CreateFleetDto) {
    return this.fleetsRepository.save(new FleetsEntity({
      ...dto,
      slug: SlugHelper.slugify(`${dto.name}-${dto.plate_number}`),
      commission: new FleetComission(dto.commission),
      photos: dto.photos.map(photo => new FleetPhotosEntity({ photo })),
    }));
  }

  findAll(user, dto: GetFleetPaginationDto) {
    const builder = this.fleetsRepository.createQueryBuilder('u')
      .orderBy('u.id', 'DESC');

    if (user.role === UserRoleEnum.OWNER) {
      builder.where('u.owner_id = :ownerId', { ownerId: user.id });
    }

    this.appendJoin(builder);
    this.appendSearch(builder, dto.q);

    return PaginationHelper.pagination(builder, dto);
  }

  private appendSearch(builder, q?: string) {
    if (q && q !== '') {
      builder
        .andWhere(new Brackets(qb => {
          qb.where('LOWER(u.name) LIKE LOWER(:q)', { q: `%${q}%` })
            .orWhere('LOWER(u.plate_number) LIKE LOWER(:q)', { q: `%${q}%` })
            .orWhere('LOWER(location.name) LIKE LOWER(:q)', { q: `%${q}%` });
        }));
    }
  }

  private appendJoin(builder) {
    return builder
      .leftJoinAndMapOne('u.photo', 'u.photos', 'photo')
      .leftJoinAndSelect('u.location', 'location');
  }

  async findOne(id: string, isDetail: boolean = true) {
    const builder = this.fleetsRepository.createQueryBuilder('u');

    if (isNaN(Number(id))) {
      builder.where('u.slug = :id', { id });
    } else {
      builder.where('u.id = :id', { id });
    }

    if (isDetail) {
      builder.leftJoinAndSelect('u.photos', 'photos')
        .leftJoinAndSelect('u.location', 'location')
        .leftJoinAndMapOne('u.photo', 'u.photos', 'photo')
        .leftJoinAndSelect('u.owner', 'owner');
    }
    const fleet = await builder.getOne();
    if (!fleet) {
      throw new NotFoundException('Could not find fleet.');
    }

    return fleet;
  }

  async update(id: number, dto: UpdateFleetDto) {
    const fleet = await this.fleetsRepository.findOneBy({ id });
    if (!fleet) {
      throw new NotFoundException('Could not find fleet.');
    }

    fleet.name = dto.name;
    fleet.slug = SlugHelper.slugify(`${dto.name}-${dto.plate_number}`);
    fleet.type = dto.type;
    fleet.color = dto.color;
    fleet.plate_number = dto.plate_number;
    fleet.price = dto.price;
    fleet.location_id = dto.location_id;

    if (dto.commission) {
      const sumOfComission = Object.values(dto.commission).reduce((a, b) => a + b, 0);
      if (sumOfComission !== 100) {
        throw new UnprocessableEntityException('Sum of commission must be 100.');
      }
      fleet.commission = new FleetComission(dto.commission);
    }

    if (dto.owner_id === null) {
      fleet.owner_id = null
    } else if (dto.owner_id) {
      const owner = await this.userSerivce.findByRole(dto.owner_id, UserRoleEnum.OWNER);
      if (!owner) {
        throw new NotFoundException('Could not find owner.');
      }

      fleet.owner_id = owner.id;
    }

    if (dto.photos) {
      await this.fleetPhotosRepository.createQueryBuilder('f')
        .where('fleet_id = :id', { id })
        .softDelete()
        .execute();

      await this.fleetPhotosRepository
        .save(dto.photos.map(photo => new FleetPhotosEntity({ photo, fleet_id: id })));
    }

    return fleet.save();
  }

  remove(id: number) {
    return this.fleetsRepository.softDelete({ id });
  }

  async findAvailableFleets(dto: GetFleetAvailabilityPaginationDto) {
    const builder = this.fleetsRepository.createQueryBuilder('u')
      .orderBy('u.name', 'ASC');

    this.appendJoin(builder);
    this.appendSearch(builder, dto.q);

    if (dto.type) {
      builder.andWhere('u.type = :type', { type: dto.type });
    }

    const locationId = dto.location_id !== undefined ? String(dto.location_id) : undefined;

    if (locationId === '0') {
      console.log("Location ID is '0', skipping location filter");
    } else if (locationId) {
      console.log("Location ID is Not '0'");
      builder.andWhere('u.location_id = :locationId', { locationId });
    }


    // Join orders with date and duration
    const startDate = new Date(dto.date);
    const endDate = DateHelper.addDays(startDate, dto.duration);
    builder.leftJoinAndSelect('u.orders', 'orders', `(
      orders.start_date < :endDate AND
      (orders.start_date + make_interval(days => orders.duration)) > :startDate AND
      orders.status != '${OrderApprovalStatusEnum.REJECTED}'
    )`, { startDate, endDate });

    // Join requests with delivery and pickup
    builder
      .leftJoin('orders.requests', 'request_pickup', `request_pickup.type = '${RequestTypeEnum.PICK_UP}'`);

    // orders.end_date = (orders.start_date + make_interval(days => orders.duration))

    // If orders is null, then the fleet is available OR
    // If request_pickup is done, then the fleet is available OR

    // TODO: extends version
    // If request_pickup status is not done, then validate orders.end_date  is not between :startDate AND endDate
    // (orders.start_date + make_interval(days => orders.duration) NOT BETWEEN :startDate AND :endDate)
    builder.andWhere(`(
      orders.id IS NULL
      OR (
        request_pickup.status = '${RequestStatusEnum.DONE}' AND
        (orders.start_date + make_interval(days => orders.duration)) NOT BETWEEN :startDate AND :endDate
      )
    )`);

    
    const pagination = PaginationHelper.pagination(builder, dto);
    const paginatedItems = await pagination;
    for (const fleet of paginatedItems.items) {
      const discount = await this.discountService.findOne(dto.date, dto.location_id, fleet.type);
      fleet.discount = discount.discount;
    }

    return pagination;
  }

  async findSlugs() {
    const result = await this.fleetsRepository.createQueryBuilder('u')
      .select('u.slug')
      // 4 hours cache
      .cache('fleet_slugs', 14400)
      .getMany();

    return result.map(fleet => fleet.slug);
  }

  async findCalendar(user, dto: GetFleetCalendarPaginationDto) {
    if (!dto.year || !dto.month) {
      throw new UnprocessableEntityException('Year and month are required.');
    }

    const startDate = DateHelper.getJakartaMoment(`${dto.year}-${dto.month}-01`).toDate();
    const endDate = DateHelper.getJakartaMoment(startDate.toISOString()).add(1, 'month').toDate();

    const builder = this.fleetsRepository.createQueryBuilder('f');
    if (user.role === UserRoleEnum.OWNER) {
      builder.where('f.owner_id = :ownerId', { ownerId: user.id });
    }

    const ordersWhere = `orders.start_date < :endDate AND (orders.start_date + make_interval(days => orders.duration)) > :startDate AND orders.status != :rejectedStatus`;
    if (JSON.parse(dto.order_only as any)) {
      builder.innerJoinAndSelect('f.orders', 'orders', ordersWhere);
    } else {
      builder.leftJoinAndSelect('f.orders', 'orders', ordersWhere);
    }

    builder
      .leftJoinAndSelect('orders.requests', 'requests')
      .leftJoinAndSelect('f.location', 'location')
      .leftJoinAndMapOne('f.photo', 'f.photos', 'photo')
      .leftJoinAndSelect('requests.driver', 'requests_driver')
      .leftJoinAndSelect('requests.logs', 'requests_logs')
      .withDeleted()
      .leftJoinAndSelect('orders.customer', 'customer')
      .andWhere('requests.deleted_at IS NULL')
      .andWhere('orders.deleted_at IS NULL')
      .andWhere('f.deleted_at IS NULL')
      .orderBy('f.name', 'ASC');

    builder.setParameters({
      startDate,
      endDate,
      rejectedStatus: OrderApprovalStatusEnum.REJECTED,
    });

    if (dto.q) {
      builder.andWhere('LOWER(f.name) LIKE LOWER(:q)', { q: `%${dto.q}%` });
    }

    if (dto.type) {
      builder.andWhere('f.type = :type', { type: dto.type });
    }

    return PaginationHelper.pagination(builder, dto);
  }
}
