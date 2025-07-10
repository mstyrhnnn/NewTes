import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateRequestDto } from '../dto/create-request.dto';
import { UpdateRequestDto } from '../dto/update-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestsEntity } from '../entities/request.entity';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { GetRequestPaginationDto } from '../dto/get-request-pagination.dto';
import { PaginationHelper } from 'src/config/helper/pagination/pagination.helper';
import { UsersService } from 'src/modules/users/users.service';
import { UserRoleEnum } from 'src/modules/users/enums/user.role.enum';
import { CreateRequestLogDto } from '../dto/create-request-log.dto';
import { RequestLogsEntity } from '../entities/request-log.entity';
import { RequestLogPhotosEntity } from '../entities/request-log-photo.entity';
import { RequestLogsTypeEnum } from '../enums/request-logs.type.enum';
import { RequestStatusEnum } from '../enums/request.status.enum';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { NotificationTypeEnum } from 'src/modules/notifications/enum/notification-type.enum';
import { REQUEST_CACHE_TTL } from 'src/common/constant/cache.ttl.constant';
import { REQUEST_CACHE_COUNT_KEY } from 'src/common/constant/cache.key.constant';
import { GetRequestOneDto } from '../dto/get-request-one.dto';
import { CreateCustomerDto } from 'src/modules/customers/dto/create-customer.dto';
import { UserIdCards } from 'src/modules/users/entities/user-id-cards.entity';
import { RequestTypeEnum } from '../enums/request.type.enum';

@Injectable()
export class RequestsService {

  constructor(
    private userService: UsersService,
    private notificationService: NotificationsService,
    private dataSource: DataSource,
    @InjectRepository(RequestsEntity) private readonly requestRepository: Repository<RequestsEntity>,
    @InjectRepository(RequestLogsEntity) private readonly requestLogRepository: Repository<RequestLogsEntity>,
  ) { }

  async validateIsCustomerVerified(customerId: number) {
    const verified = await this.userService.isUserVerified(customerId);
    if (!verified) {
      throw new UnprocessableEntityException('Customer must be verified.');
    }
  }

  async validateCustomerDriver(customerId?: number, driverId?: number | number[]) {
    if (customerId) {
      const customerExist = await this.userService.checkUserRole(customerId, UserRoleEnum.CUSTOMER);
      if (!customerExist) {
        throw new UnprocessableEntityException('Could not find customer.');
      }
    }

    if (driverId) {
      if (Array.isArray(driverId)) {
        return Promise.all(driverId.map(async id => {
          const driverExist = await this.userService.checkUserRole(id, UserRoleEnum.DRIVER);
          if (!driverExist) {
            throw new UnprocessableEntityException('Could not find driver.');
          }
        }));
      } else {
        const driverExist = await this.userService.checkUserRole(driverId, UserRoleEnum.DRIVER);
        if (!driverExist) {
          throw new UnprocessableEntityException('Could not find driver.');
        }
      }
    }
  }

  async updatePaperPartner(user: UserEntity) {
    return this.userService.updatePaperPartner(user.paper_id, user.paper_number, user);
  }

  async createPaperPartnerIfNotExist(customerId: number) {
    return this.userService.createPaperPartnerIfNotExist(customerId);
  }

  async getCustomer(customerId: number) {
    return this.userService.findOne(customerId, true);
  }

  // TODO: Implement fleet availability validation
  async create(dto: CreateRequestDto) {
    await this.validateCustomerDriver(dto.customer_id, dto.driver_id);

    const request = await this.requestRepository.save(new RequestsEntity(dto));

    await this.notificationService.createNotification(
      NotificationTypeEnum['request.create'],
      request.id,
      dto.driver_id,
    );

    await this.clearRequestCachecount();

    return request;
  }

  findAll(dto: GetRequestPaginationDto, driverId?: number) {
    const builder = this.requestRepository.createQueryBuilder('r')
      .orderBy('r.id', 'DESC');

    this.appendJoin(builder);

    builder.andWhere('r.driver_id IS NOT NULL');

    if (dto.status) {
      builder.andWhere('r.status = :status', { status: dto.status });
    }

    if (driverId) {
      builder.andWhere('r.driver_id = :driverId', { driverId });
    }

    if (dto.q && dto.q !== '') {
      builder
        .andWhere(new Brackets(qb => {
          qb.where('LOWER(customer.name) LIKE LOWER(:q)', { q: `%${dto.q}%` })
            .orWhere('LOWER(driver.name) LIKE LOWER(:q)', { q: `%${dto.q}%` })
            .orWhere('LOWER(fleet.name) LIKE LOWER(:q)', { q: `%${dto.q}%` })
            .orWhere('LOWER(order_customer.name) LIKE LOWER(:q)', { q: `%${dto.q}%` })
            .orWhere('LOWER(order_fleet.name) LIKE LOWER(:q)', { q: `%${dto.q}%` });
        }));
    }

    if (dto.start_date && dto.end_date) {
      builder.andWhere(`(
        (r.start_date BETWEEN :start_date AND :end_date) OR
        (
          CASE 
            WHEN r.type = 'pick_up' THEN (order.start_date + make_interval(days => order.duration)) BETWEEN :start_date AND :end_date
          ELSE
            order.start_date BETWEEN :start_date AND :end_date
          END
        )
      )`, {
        start_date: dto.start_date,
        end_date: dto.end_date,
      });
    }

    return PaginationHelper.pagination(builder, dto);
  }

  async findOne(id: number, dto: GetRequestOneDto) {
    const builder = this.requestRepository.createQueryBuilder('r')
      .where('r.id = :id', { id });

    this.appendJoin(builder, true);

    const request = await builder.getOne();
    if (!request) {
      throw new NotFoundException('Could not find request.');
    }

    if (dto.with_related_requests == 'true') {
      const relatedRequests = this.requestRepository.createQueryBuilder('r')
        .where('(r.fleet_id = :fleetId OR order.fleet_id = :fleetId)', { fleetId: request.fleet_id ?? request.order?.fleet_id })
        .andWhere('r.status = :status', { status: RequestStatusEnum.DONE });

      this.appendJoin(relatedRequests);

      request.related_requests = await relatedRequests
        .limit(3)
        .orderBy('r.created_at', 'DESC')
        .getMany();
    } else {
      request.related_requests = null;
    }

    return {
      ...request,
      pdf_template_delivery_pickup: 'https://s3.app.transgo.id/main/tncpdf/new-preview-pengantaran-june.pdf',
      pdf_template_pickup_return: 'https://s3.app.transgo.id/main/tncpdf/preview2.pdf',
    };
  }

  private appendJoin(builder: SelectQueryBuilder<RequestsEntity>, isDetail = false) {
    builder
      .withDeleted()
      .leftJoinAndSelect('r.customer', 'customer')
      .leftJoinAndSelect('r.driver', 'driver')
      .leftJoinAndSelect('r.fleet', 'fleet')
      .andWhere('r.deleted_at IS NULL');

    builder
      .withDeleted()
      .leftJoinAndSelect('r.order', 'order')
      .leftJoinAndSelect('order.customer', 'order_customer')
      .leftJoinAndSelect('order.fleet', 'order_fleet')
      .andWhere('r.deleted_at IS NULL');

    builder.leftJoinAndSelect('r.logs', 'logs');

    if (isDetail) {
      builder
        .leftJoinAndSelect('logs.photos', 'logs_photos', 'logs_photos.deleted_at IS NULL')
        .leftJoinAndSelect('fleet.photos', 'fleet_photos', 'fleet_photos.deleted_at IS NULL')
        .leftJoinAndSelect('customer.id_cards', 'customer_id_cards', 'customer_id_cards.deleted_at IS NULL')
        .addSelect('customer.phone_number', 'customer_phone_number')
        .addSelect('customer.emergency_phone_number', 'customer_emergency_phone_number');

      builder
        .leftJoinAndSelect('order_fleet.photos', 'order_fleet_photos', 'order_fleet_photos.deleted_at IS NULL')
        .leftJoinAndSelect('order_customer.id_cards', 'order_customer_id_cards', 'order_customer_id_cards.deleted_at IS NULL')
        .addSelect('order_customer.phone_number', 'order_customer_phone_number')
        .addSelect('order_customer.emergency_phone_number', 'order_customer_emergency_phone_number');
    } else {
      builder
        .leftJoinAndMapOne('fleet.photo', 'fleet.photos', 'fleet_photo', 'fleet_photo.deleted_at IS NULL')
        .leftJoinAndMapOne('order_fleet.photo', 'order_fleet.photos', 'order_fleet_photo', 'order_fleet_photo.deleted_at IS NULL');
    }

    return builder;
  }

  async update(id: number, dto: UpdateRequestDto) {
    await this.validateCustomerDriver(dto.customer_id, dto.driver_id);

    if (dto.driver_id || dto.start_date) {
      const request = await this.requestRepository.createQueryBuilder('r')
        .addSelect('r.driver_id')
        .getOne();

      // Add notification if driver changed
      if (dto.driver_id && request.driver_id != dto.driver_id) {
        await this.notificationService.createNotification(
          NotificationTypeEnum['request.create'],
          id,
          dto.driver_id,
        );
      }
      // Add notification if start date changed
      else if (dto.start_date && (new Date(request.start_date)).getTime() !== (new Date(dto.start_date).getTime())) {
        await this.notificationService.createNotification(
          NotificationTypeEnum['request.update'],
          id,
          request.driver_id,
        );
      }
    }

    return this.requestRepository.update(id, new RequestsEntity(dto));
  }

  async removeByOrderId(orderId: number) {
    await this.clearRequestCachecount();

    return this.requestRepository.softDelete({ order_id: orderId });
  }

  async remove(id: number) {
    await this.clearRequestCachecount();

    return this.requestRepository.softDelete({ id });
  }

  async log(user: UserEntity, id: number, dto: CreateRequestLogDto) {
    if (dto.type === RequestLogsTypeEnum.END && (!dto.photos || dto.photos.length == 0)) {
      throw new UnprocessableEntityException('Photos are required for end request.');
    }

    const request = await this.requestRepository.createQueryBuilder('r')
      .where('r.id = :id', { id })
      .addSelect('r.driver_id')
      .leftJoinAndSelect('r.order', 'order')
      .leftJoinAndSelect('order.requests', 'order_requests')
      .getOne();

    if (!request) {
      throw new NotFoundException('Request not found.');
    } 
    // Check if driver is not the owner of the request
    // else if (request.driver_id != user.id) {
    //   throw new ForbiddenException('You do not have access for this request.');
    // }
    // Check if pick up request, start request must be done first
    // else if (request.type == RequestTypeEnum.PICK_UP && request.order?.start_request?.status != RequestStatusEnum.DONE) {
    //   throw new UnprocessableEntityException('Start request must be done first.');
    // }

    await this.validateRequestStatus(request, dto.type);

    if (dto.type === RequestLogsTypeEnum.START) {
      await this.updateRequestStatus(id, RequestStatusEnum.ON_PROGRESS);
    } else {
      await this.updateRequestStatus(id, RequestStatusEnum.DONE);
    }

    await this.clearRequestCachecount();

    return this.requestLogRepository.save(new RequestLogsEntity({
      ...dto,
      request_id: id,
      pdf_tnc: dto.pdf_tnc,
      photos: dto.photos ? dto.photos.map(photo => new RequestLogPhotosEntity({ photo })) : [],
    }));    
  }

  private async clearRequestCachecount() {
    await this.dataSource.queryResultCache.remove([REQUEST_CACHE_COUNT_KEY]);
  }

  private updateRequestStatus(id: number, status: RequestStatusEnum) {
    return this.requestRepository.update(id, { status });
  }

  private async validateRequestStatus(request: RequestsEntity, status: RequestLogsTypeEnum) {
    if (status == RequestLogsTypeEnum.END && !request.is_self_pickup) {
      const logExist = this.statusLogExist(request.id, RequestLogsTypeEnum.START);
      if (!logExist) {
        throw new UnprocessableEntityException('Must start the request first.');
      }
    }

    if (request.status === RequestStatusEnum.ON_PROGRESS && status === RequestLogsTypeEnum.START) {
      throw new UnprocessableEntityException('Request already started.');
    } else if (request.status === RequestStatusEnum.DONE) {
      throw new UnprocessableEntityException('Request already ended.');
    }
  }

  private statusLogExist(id, type: RequestLogsTypeEnum) {
    return this.requestLogRepository.findOne({ where: { request_id: id, type } });
  }

  async getStatusCount() {
    const result = await this.requestRepository
      .createQueryBuilder('r')
      .select('r.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('r.deleted_at IS NULL')
      .groupBy('status')
      .cache(REQUEST_CACHE_COUNT_KEY, REQUEST_CACHE_TTL)
      .getRawMany();

    return result.reduce((acc, item) => {
      acc[item.status] = +item.count;
      return acc;
    }, {});
  }

  async createCustomer(dto: CreateCustomerDto) {
    return this.userService.create(new UserEntity({
      ...dto,
      id_cards: dto.id_cards.map(idCard => new UserIdCards({ photo: idCard })),
      role: UserRoleEnum.CUSTOMER,
    }));
  }
}
