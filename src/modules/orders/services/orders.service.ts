import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from '../entities/orders.entity';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { GetOrderPaginationDto, GetOrdersStatus } from '../dto/get-order-pagination.dto';
import { PaginationHelper } from 'src/config/helper/pagination/pagination.helper';
import { RequestsEntity } from '../../requests/entities/request.entity';
import { RequestTypeEnum } from '../../requests/enums/request.type.enum';
import { FleetsService } from '../../fleets/fleets.service';
import { DeviceTokensService } from '../../device_tokens/device_token.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { InsurancesService } from '../../insurances/insurances.service';
import { DRIVER_FEE_OUT_TOWN, CAR_WEEKEND_PRICE, DRIVER_FEE_IN_TOWN, MOTORCYCLE_WEEKEND_PRICE, CAR_OUT_OF_TOWN_FEE, MOTORCYCLE_OUT_OF_TOWN_FEE } from 'src/common/constant/price.constant';
import { PPH_21_25_GROSS_UP, PPH_21_25_ID_ENV } from 'src/common/constant/tax.constant';
import { InvoiceHelper } from 'src/config/helper/string/invoice.helper';
import { OrderPaymentStatusEnum } from '../enums/order.payment-status.enum';
import { PriceCalculationInterface } from '../interface/price-calculation.interface';
import { RequestsService } from 'src/modules/requests/services/requests.service';
import { OrderPgService } from './order-pg.service';
import { DateHelper } from 'src/config/helper/date/date.helper';
import { PurchaseInvoiceItemParam } from 'src/common/payment/paper/param/purchase-invoice-item.param';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { SalesInvoiceCreateResponse } from 'src/common/payment/paper/response/sales-invoices.create.response';
import { OrderApprovalStatusEnum } from '../enums/order.status.enum';
import { OrderStatusLogsService } from './order-status-logs.service';
import { OrderStatusLogsEntity } from '../entities/order-status-logs.entity';
import { ORDER_CACHE_TTL } from 'src/common/constant/cache.ttl.constant';
import { ORDER_CACHE_COUNT_KEY } from 'src/common/constant/cache.key.constant';

import { MailService } from 'src/modules/mail/mail.service';
import { ACCEPTED_ORDER_MESSAGE, ACCEPTED_ORDER_SUPPORT_TEXT, ADMIN_CANCEL_MESSAGE, CHANGES_ORDER_MESSAGE, CUSTOMER_CANCEL_MESSAGE, PAID_ORDER_ADMIN_MESSAGE, REJECTED_ORDER_MESSAGE, REJECTED_ORDER_SUPPORT_TEXT, REJECTED_USER_MESSAGE } from 'src/common/constant/mail.message.constant';

import { QontakService } from 'src/modules/qontak/qontak.service';
import { QONTAK_ACCEPTED_ORDER_OWNER, QONTAK_ACCEPTED_ORDER_USER, QONTAK_CANCEL_ORDER, QONTAK_CANCEL_ORDER_CONFIRMATION, QONTAK_CHANGES_ORDER_MESSAGE, QONTAK_REJECTED_ORDER, QONTAK_REJECTED_USER_MESSAGE } from 'src/common/constant/qontak.constans';

import { FleetsEntity } from 'src/modules/fleets/entities/fleet.entity';
import { OrderRequestDto } from '../dto/order-request.dto';
import { CreateOrderCustomerDto } from '../dto/create-order.customer.dto';
import { RejectOrderDto } from '../dto/reject-order.dto';
import { RequestStatusEnum } from 'src/modules/requests/enums/request.status.enum';
import { UserRoleEnum } from 'src/modules/users/enums/user.role.enum';
import { PurchaseInvoiceResponse } from 'src/common/payment/paper/response/purchase-invoice.response';
import { SentryHelper } from 'src/config/helper/logging/sentry.helper';
import { FleetTypeEnum } from 'src/modules/fleets/enums/fleet.type.enum';
import { LedgersService } from 'src/modules/ledgers/ledgers.service';
import { DeleteOrderDto } from '../dto/delete-order.dto';
import { map } from 'rxjs';
import { DiscountService } from 'src/modules/discount/discount.service';
import * as firebase from 'firebase-admin';
import { SalesInvoiceUpdateResponse } from 'src/common/payment/paper/response/sales-invoices.update.response';
import { UserStatusEnum } from 'src/modules/users/enums/user.status.enum';
import { UsersService } from 'src/modules/users/users.service';
import { ExtendRentalDto } from '../dto/extend-rental.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity) private readonly orderRepository: Repository<OrderEntity>,
    private readonly usersService: UsersService, 
    private dataSource: DataSource,
    private fleetService: FleetsService,
    private deviceTokensService: DeviceTokensService,
    private notificationsService: NotificationsService,
    private orderInsurancesService: InsurancesService,
    private requestService: RequestsService,
    private orderPgService: OrderPgService,
    private orderStatusLogsService: OrderStatusLogsService,
    private mailService: MailService,
    private qontakService: QontakService,
    private ledgerService: LedgersService,
    private discountService: DiscountService,
  ) { }

  async calculatePrice(dto: Partial<CreateOrderDto>): Promise<PriceCalculationInterface> {
    const fleet = await this.fleetService.findOne(dto.fleet_id.toString(), true);
    const insurance = dto.insurance_id && dto.insurance_id != 0 ? await this.orderInsurancesService.findOne(dto.insurance_id) : null;

    const date = dto.date ?? (new Date()).toISOString();
    const duration = dto.duration ?? 1;
    const rentPrice = duration * fleet.price;
    const servicePrice = dto.service_price ?? 0;

    const insurancePrice = insurance?.price ?? 0;

    const dailyDriverPrice = dto.is_out_of_town ? DRIVER_FEE_OUT_TOWN : DRIVER_FEE_IN_TOWN;
    const driverPrice = dto.is_with_driver ? duration * dailyDriverPrice : 0;

    const outOfTownPrice = dto.is_out_of_town ? (fleet.type === FleetTypeEnum.CAR ? CAR_OUT_OF_TOWN_FEE : MOTORCYCLE_OUT_OF_TOWN_FEE) : 0;

    const additionalItemsPrice = dto.additional_services?.reduce((acc, item) => acc + item.price, 0) ?? 0;

    const weekendDays = DateHelper.getWeekendDays(DateHelper.getJakartaMoment(date), duration);
    const weekendPrice = fleet.type === FleetTypeEnum.CAR ? CAR_WEEKEND_PRICE : MOTORCYCLE_WEEKEND_PRICE;

    const totalWeekendPrice = weekendDays.length * weekendPrice;

    const orderDate = new Date(dto.date);
    const discountResult = await this.discountService.findOne(orderDate, fleet.location.id, fleet.type);
    dto.discount = (dto.discount !== null && dto.discount !== undefined)
      ? dto.discount
      : discountResult.discount;

    const discountPercentage = dto.discount ?? 0;
    const discount = rentPrice * (discountPercentage / 100);
    const subTotal = rentPrice + servicePrice + insurancePrice + driverPrice + additionalItemsPrice + outOfTownPrice + totalWeekendPrice - discount;
    const total = subTotal;

    const tax = Number((total * PPH_21_25_GROSS_UP).toFixed(2));


    const grandTotal = total + tax;

    return {
      rent_price: fleet.price,
      total_rent_price: rentPrice,
      service_price: servicePrice,
      insurance_price: insurancePrice,
      driver_price: dailyDriverPrice,
      out_of_town_price: outOfTownPrice,
      total_driver_price: driverPrice,
      weekend_days: weekendDays,
      weekend_price: weekendPrice,
      additional_services: dto.additional_services ?? [],
      total_weekend_price: totalWeekendPrice,
      sub_total: subTotal,
      discount_percentage: discountPercentage,
      discount: discount,
      total: total,
      tax: tax,
      grand_total: grandTotal,
      insurance: insurance,
      fleet: fleet,
    };
  }

  async calculateExtendedPrice(orderId: number, dto: ExtendRentalDto): Promise<{ extendedPrice: number, extendedDays: number }> {
    const order = await this.findOne(orderId, true);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if the order is in a state that allows extension (disini accepted or pending)
    if (order.status !== OrderApprovalStatusEnum.ACCEPTED && order.status !== OrderApprovalStatusEnum.PENDING) {
      throw new ConflictException('Rental cannot be extended due to its current status.');
    }

    const currentEndDate = order.end_date;
    const newEndDate = new Date(dto.newEndDate);

    if (newEndDate <= currentEndDate) {
      throw new BadRequestException('New end date must be after current end date.');
    }

    const diffTime = Math.abs(newEndDate.getTime() - currentEndDate.getTime());
    const extendedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Recalculate price for the extended duration using a temporary order DTO.
    const tempOrderDto: Partial<CreateOrderDto> = {
      fleet_id: order.fleet.id, 
      date: currentEndDate.toISOString(), // Start calculation from the current end date
      duration: extendedDays,
      is_with_driver: order.is_with_driver, 
      is_out_of_town: order.is_out_of_town, 
      insurance_id: order.insurance?.id, 
      additional_services: order.additional_services, 
      discount: order.discount, 
      service_price: order.service_price, 
    };

    const calculationResult = await this.calculatePrice(tempOrderDto); 

    return {
      extendedPrice: calculationResult.total,
      extendedDays: extendedDays,
    };
  }

  async confirmRentalExtension(orderId: number, dto: ExtendRentalDto, user: UserEntity): Promise<any> {
    const order = await this.findOne(orderId, true); 
    if (!order) {
      throw new NotFoundException('Order not found'); 
    }

    // Authorization check
    if (user.role === UserRoleEnum.CUSTOMER && order.customer.id !== user.id) { 
      throw new ForbiddenException('You are not authorized to extend this order.'); 
    }
    // Check if the order is in a state that allows extension
    if (order.status !== OrderApprovalStatusEnum.ACCEPTED && order.status !== OrderApprovalStatusEnum.PENDING) { 
      throw new ConflictException('Rental cannot be extended due to its current status.'); 
    }

    const currentEndDate = order.end_date; 
    const newEndDate = new Date(dto.newEndDate); 

    if (newEndDate <= currentEndDate) {
      throw new BadRequestException('New end date must be after current end date.'); 
    }

    const diffTime = Math.abs(newEndDate.getTime() - currentEndDate.getTime());
    const extendedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Recalculate extension price to ensure consistency and prevent tampering
    const calculatedExtensionPrice = await this.calculateExtendedPrice(orderId, dto); 

    // Update order end date and total price
    order.end_date = newEndDate; 
    order.duration = order.duration + extendedDays; // Update total duration
    order.total_price = order.total_price + calculatedExtensionPrice.extendedPrice; // Add extension cost to total price

    // Update payment gateway invoice (if applicable)
    if (order.external_id) { 
        try {
            const updatedPayment = await this.orderPgService.updateSalesInvoice(order.external_id, { 
                total: order.total_price, 
                items: this.generatePaymentItems(await this.calculatePrice(order), order), // Re-generate items for the full new order duration
                customer: order.customer, 
                date: order.start_date.toISOString(), 
                invoiceNumber: order.invoice_number, 
                discount: order.discount, 
                duration: order.duration, 
            });
            order.payment_pdf_url = updatedPayment.pdf_url_short; 
            order.payment_link = updatedPayment.payper_url; 
        } catch (error) {
            SentryHelper.captureEvent(user, 'confirmRentalExtension.updateSalesInvoiceFailed', { orderId, error }); 
            throw new ConflictException(`Failed to update payment gateway for extension: ${error.message || error}`); 
        }
    } else {
        throw new UnprocessableEntityException('Cannot extend an order without an existing payment record for automatic processing.'); 
    }

    await this.orderRepository.save(order); // Save updated order
    await this.createOrderStatusLog(order.id, OrderApprovalStatusEnum.ACCEPTED, `Rental extended by ${extendedDays} days.`); // Log extension

    // Update ledger
    await this.ledgerService.updateByOrder(order, order.fleet); 

    // Clear cache
    await this.clearOrderCachecount(); 

    return {
      message: 'Rental successfully extended',
      order: {
        id: order.id.toString(), 
        vehicleName: order.fleet.name, 
        currentStartDate: DateHelper.format(order.start_date, 'YYYY-MM-DD'), 
        currentEndDate: DateHelper.format(currentEndDate, 'YYYY-MM-DD'), 
        newEndDate: DateHelper.format(newEndDate, 'YYYY-MM-DD'), 
        extensionCost: calculatedExtensionPrice.extendedPrice,
        totalRentalCost: order.total_price, 
        status: order.status, 
      },
    };
  }

  async createCustomerOrder(dto: CreateOrderCustomerDto, user) {
    // User validation for customer
    if (!user?.id && !dto.new_customer) {
      throw new ConflictException('User is required.');
    }

    // throw error when user is verification
    if (user?.status == UserStatusEnum.PENDING) {
      throw new UnprocessableEntityException({
        message: 'Akun Masih Dalam Proses Verifikasi',
        error: 'Unprocessable Order',
        statusCode: 422,
        code: 'Akun Masih Dalam Proses Verifikasi Tidak Dapat Melakukan Pemesanan',
    });
    }

    if (user?.status == UserStatusEnum.REJECTED) {
      throw new UnprocessableEntityException({
        message: 'Akun Anda Ditolak Admin Anda Tidak Dapat Melakukan Transaksi',
        error: 'Unprocessable Order',
        statusCode: 422,
        code: 'Akun Anda Ditolak Admin Anda Tidak Dapat Melakukan Transaksi',
    });
    }

    // Validate fleet availability
    await this.validateFleetAvailability(dto.fleet_id, dto.date, dto.duration);

    // Create customer if not exists
    let customerId = user?.id;
    if (!customerId && dto.new_customer) {
      const customer = await this.requestService.createCustomer(dto.new_customer);
      customerId = customer.id;
    }

    return await this.createOrder(
      dto,
      customerId,
      {
        start: dto.start_request,
        end: dto.end_request,
      },
      OrderApprovalStatusEnum.PENDING,
      false,
    );
  }

  async createAdminOrder(dto: CreateOrderDto) {
    // Validate fleet availability
    await this.validateFleetAvailability(dto.fleet_id, dto.date, dto.duration);

    return await this.createOrder(
      dto,
      dto.customer_id,
      {
        start: dto.start_request,
        end: dto.end_request,
      },
      OrderApprovalStatusEnum.ACCEPTED
    );
  }

  async createOrder(
    dto: Partial<CreateOrderDto>,
    customerId: number,
    request: {
      start: OrderRequestDto,
      end: OrderRequestDto,
    },
    status: OrderApprovalStatusEnum = OrderApprovalStatusEnum.PENDING,
    shouldCreateInvoice = true,
    retryCount = 0,
  ) {
    // Validate customer and driver
    await this.requestService.validateCustomerDriver(
      customerId,
      request.start.driver_id && request.end.driver_id ? [
        request.start.driver_id,
        request.end.driver_id,
      ] : []
    );

    // Validate address must be empty if self pickup
    if (request.start.is_self_pickup && request.start.address) {
      throw new UnprocessableEntityException('Address must be empty if self pickup.');
    } else if (request.end.is_self_pickup && request.end.address) {
      throw new UnprocessableEntityException('Address must be empty if self pickup.');
    }

    // Calculate price
    const calculatedPrice = await this.calculatePrice({ ...dto });

    // Customer
    const customer = await this.requestService.createPaperPartnerIfNotExist(customerId);

    // Validate customer contact
    this.validateCustomerContact(customer);

    // Invoice number
    const invoiceNumber = InvoiceHelper.generateInvoiceNumber();

    // Integration with payment gateway
    let payment: PurchaseInvoiceResponse;
    if (shouldCreateInvoice) {
      try {
        payment = await this.orderPgService.createSalesInvoice({
          customer: customer,
          date: dto.date,
          invoiceNumber: invoiceNumber,
          items: this.generatePaymentItems(calculatedPrice, dto),
          discount: calculatedPrice.discount,
          total: calculatedPrice.grand_total,
          duration: dto.duration,
        });
      } catch (error) {
        if (error.message = `Failed partner doesn't match`) {
          await this.requestService.updatePaperPartner(customer);
          console.log('Retry create order', retryCount);
          console.log(error);
          if (retryCount >= 3) {
            throw new ConflictException('Failed to create order.', { cause: error });
          }

          return await this.createOrder(dto, customerId, request, status, shouldCreateInvoice, retryCount + 1);
        }
      }
    }

    // Clear cache
    await this.clearOrderCachecount();

    const createOrder = await this.orderRepository.save(new OrderEntity({
      description: dto.description,
      invoice_number: invoiceNumber,
      customer_id: customerId,
      fleet_id: calculatedPrice.fleet.id,
      insurance_id: calculatedPrice.insurance?.id,
      requests: [
        new RequestsEntity({
          type: RequestTypeEnum.DELIVERY,
          is_self_pickup: request.start.is_self_pickup,
          address: request.start.address,
          distance: request.start.distance,
          driver_id: request.start.driver_id,
        }),
        new RequestsEntity({
          type: RequestTypeEnum.PICK_UP,
          is_self_pickup: request.end.is_self_pickup,
          address: request.end.address,
          distance: request.end.distance,
          driver_id: request.end.driver_id,
        }),
      ],
      service_price: calculatedPrice.service_price,
      start_date: new Date(dto.date),
      duration: dto.duration,
      status: status,
      payment_status: OrderPaymentStatusEnum.PENDING,
      total_tax: calculatedPrice.tax,
      sub_total_price: calculatedPrice.sub_total,
      total_price: calculatedPrice.grand_total,
      discount: calculatedPrice.discount_percentage,
      additional_services: calculatedPrice.additional_services,
      driver_price: calculatedPrice.total_driver_price,
      out_of_town_price: calculatedPrice.out_of_town_price,
      payment_pdf_url: payment?.pdf_url_short,
      payment_link: payment?.payper_url,
      external_id: payment?.id,
      status_logs: [
        new OrderStatusLogsEntity({
          status: status,
        }),
      ]
    }));

    // Send email if status is accepted
    if (status == OrderApprovalStatusEnum.ACCEPTED) {
      this.sendEmailAccept(createOrder, calculatedPrice.fleet, customer);
    }

    // Add order to ledger
    await this.ledgerService.createByOrder(createOrder, calculatedPrice.fleet);

    return createOrder;
  }

  async findAll(user, dto: GetOrderPaginationDto) {
    const isAdmin = user.role === UserRoleEnum.ADMIN;

    const builder = this.orderRepository.createQueryBuilder('o');

    this.appendJoin(builder);

    if (!isAdmin) {
      builder.andWhere('(o.customer_id = :customerId OR requests_customer.id = :customerId)', { customerId: user.id });
    }

    if (dto.q && dto.q !== '') {
      builder
        .andWhere(new Brackets(qb => {
          qb.where('customer.name ILIKE :q', { q: `%${dto.q}%` })
            .orWhere('fleet.name ILIKE :q', { q: `%${dto.q}%` })
            .orWhere('invoice_number ILIKE :q', { q: `%${dto.q}%` });;
        }));
    }

    if (dto.status) {
      this.handleStatusFilter(builder, dto.status);
    }

    if (dto.start_date && dto.end_date && dto.start_date !== '' && dto.end_date !== '') {
      builder.andWhere('o.start_date BETWEEN :startDate AND :endDate', {
        startDate: new Date(dto.start_date),
        endDate: new Date(dto.end_date),
      });
    }

    if (dto.order_by && dto.order_column) {
      builder.orderBy(`o.${dto.order_column}`, dto.order_by);
    }

    return PaginationHelper.pagination(builder, dto);
  }

  private handleStatusFilter(builder: SelectQueryBuilder<OrderEntity>, status: GetOrdersStatus) {
    builder.innerJoin('o.requests', 'request_delivery', `request_delivery.type = '${RequestTypeEnum.DELIVERY}'`);
    builder.innerJoin('o.requests', 'request_pickup', `request_pickup.type = '${RequestTypeEnum.PICK_UP}'`);

    switch (status) {
      case GetOrdersStatus.PENDING:
        builder.andWhere(`o.status = '${OrderApprovalStatusEnum.PENDING}'`);
        break;
      case GetOrdersStatus.CONFIRMED:
        builder.andWhere(`(o.status = '${OrderApprovalStatusEnum.ACCEPTED}' AND request_delivery.status = '${RequestStatusEnum.PENDING}')`);
        break;
      case GetOrdersStatus.ON_PROGRESS:
        builder.andWhere(`(o.status = '${OrderApprovalStatusEnum.ACCEPTED}' AND ((request_delivery.status = '${RequestStatusEnum.ON_PROGRESS}' OR request_pickup.status = '${RequestStatusEnum.ON_PROGRESS}') OR (request_delivery.status = '${RequestStatusEnum.DONE}' AND request_pickup.status = '${RequestStatusEnum.PENDING}')))`);
        break;
      case GetOrdersStatus.DONE:
        builder.andWhere(`(o.status = '${OrderApprovalStatusEnum.ACCEPTED}' AND request_pickup.status = '${RequestStatusEnum.DONE}')`);
        break;
    }

    return builder;
  }

  private appendJoin(builder: SelectQueryBuilder<OrderEntity>, isDetail = false) {
    builder
      .withDeleted()
      .leftJoinAndSelect('o.customer', 'customer')
      .leftJoinAndSelect('o.fleet', 'fleet')
      .leftJoinAndSelect('fleet.location', 'fleet_location')
      .leftJoinAndSelect('o.requests', 'requests', 'requests.deleted_at IS NULL')
      .leftJoinAndSelect('requests.driver', 'requests_driver')
      .leftJoinAndSelect('requests.customer', 'requests_customer')
      .addSelect('requests_driver.phone_number', 'requests_driver_phone_number')
      .andWhere('o.deleted_at IS NULL');

    builder
      .leftJoinAndSelect('requests.logs', 'requests_logs')
      .leftJoinAndMapOne('fleet.photo', 'fleet.photos', 'fleet_photo', 'fleet_photo.deleted_at IS NULL');

    if (isDetail) {
      builder
        .leftJoinAndSelect('fleet.photos', 'fleet_photos', 'fleet_photos.deleted_at IS NULL')
        .leftJoinAndSelect('customer.id_cards', 'customer_id_cards', 'customer_id_cards.deleted_at IS NULL')
        .leftJoinAndSelect('o.insurance', 'insurance', 'insurance.deleted_at IS NULL')
        .leftJoinAndSelect('requests_logs.photos', 'logs_photos', 'logs_photos.deleted_at IS NULL')
        .leftJoinAndSelect('o.status_logs', 'o_status_logs')
        .addSelect('customer.email', 'customer_email')
        .addSelect('customer.phone_number', 'customer_phone_number')
        .addSelect('customer.emergency_phone_number', 'customer_emergency_phone_number');
    }

    return builder;
  }

  async findOne(id: number, isDetail = true, user?) {
    const builder = this.orderRepository.createQueryBuilder('o')
      .where('o.id = :id', { id });

    this.appendJoin(builder, isDetail);

    if (user?.role === UserRoleEnum.CUSTOMER && user?.id) {
      builder.andWhere('(o.customer_id = :customerId OR requests_customer.id = :customerId)', { customerId: user.id });
    } else if (user?.role === UserRoleEnum.OWNER && user?.id) {
      builder.andWhere('fleet.owner_id = :ownerId', { ownerId: user.id });
    }

    const request = await builder.getOne();
    if (!request) {
      throw new NotFoundException('Could not find request.');
    }

    return request;
  }

  async update(id: number, dto: UpdateOrderDto, status?: OrderApprovalStatusEnum) {
    const order = await this.findOne(id, true);

    // Validate users
    await this.validateUsers(dto.customer_id, [
      dto.start_request.driver_id,
      dto.end_request.driver_id,
    ]);

    // Validate fleet availability
    await this.validateFleetAvailability(dto.fleet_id, dto.date, dto.duration, order.id);

    // Customer
    const customer = await this.requestService.getCustomer(dto.customer_id);

    // Validate customer contact
    this.validateCustomerContact(customer);

    // Price calculation
    const calculatedPrice = await this.calculatePrice({ ...dto });

    const isItemsChanged = order.total_price != calculatedPrice.grand_total ||
      calculatedPrice.rent_price != order.fleet.price ||
      order.service_price != calculatedPrice.service_price ||
      order.out_of_town_price != calculatedPrice.out_of_town_price ||
      order.additional_services.length != calculatedPrice.additional_services.length ||
      order.duration != dto.duration ||
      order.discount != calculatedPrice.discount_percentage;

    if (order.external_id == null) {
      // Create new payment
      try {
        const createdPayment = await this.orderPgService.createSalesInvoice({
          customer: customer,
          date: dto.date,
          invoiceNumber: order.invoice_number,
          items: this.generatePaymentItems(calculatedPrice, dto),
          discount: calculatedPrice.discount,
          total: calculatedPrice.grand_total,
          duration: dto.duration,
        });

        order.payment_pdf_url = createdPayment.pdf_url_short;
        order.payment_link = createdPayment.payper_url;
        order.total_price = calculatedPrice.grand_total;
        order.external_id = createdPayment.id;
      } catch (error) {
        if (error.message == `Failed partner doesn't match`) {
          await this.requestService.updatePaperPartner(customer);
          throw new ConflictException('Failed, silahkan kembali dan coba lagi.');
        } else {
          console.log(error);
          throw new ConflictException(`Failed to create payment. ${error}`);
        }
      }
    } else if (isItemsChanged && dto.customer_id == order.customer.id) {
      // Validate if amount is less than the previous payment
      if (calculatedPrice.grand_total < order.total_price) {
        throw new UnprocessableEntityException('Harga sewa tidak boleh kurang dari harga sebelumnya.');
      }

      // Update payments
      try {
        const updatedPayment = await this.orderPgService.updateSalesInvoice(order.external_id, {
          total: calculatedPrice.grand_total,
          items: this.generatePaymentItems(calculatedPrice, dto),
          customer: customer,
          date: dto.date,
          invoiceNumber: order.invoice_number,
          discount: calculatedPrice.discount,
          duration: dto.duration,
        });

        this.pgCallback(updatedPayment.id, order.invoice_number);

        this.handleEmailChanges(order, calculatedPrice, dto);

        order.payment_pdf_url = updatedPayment.pdf_url_short;
        order.payment_link = updatedPayment.payper_url;
        order.total_price = calculatedPrice.grand_total;
        order.external_id = updatedPayment.id;
      } catch (error) {
        if (error.message == `Failed partner doesn't match`) {
          await this.requestService.updatePaperPartner(customer);
          throw new ConflictException('Failed, silahkan kembali dan coba lagi.');
        } else {
          console.log(error);
          const errorMessage = error?.response?.message || error?.message || error.toString();
          throw new ConflictException(`Failed to update payment. ${errorMessage}`);
        }
      }


    } else if (dto.customer_id != order.customer.id) {
      // Delete old payment
      await this.orderPgService.deleteSalesInvoice(order.external_id);

      // Create new payment
      try {
        const createdPayment = await this.orderPgService.createSalesInvoice({
          customer: customer,
          date: dto.date,
          invoiceNumber: order.invoice_number,
          items: this.generatePaymentItems(calculatedPrice, dto),
          discount: calculatedPrice.discount,
          total: calculatedPrice.grand_total,
          duration: dto.duration,
        });

        order.payment_pdf_url = createdPayment.pdf_url_short;
        order.payment_link = createdPayment.payper_url;
        order.total_price = calculatedPrice.grand_total;
        order.external_id = createdPayment.id;
      } catch (error) {
        if (error.message == `Failed partner doesn't match`) {
          await this.requestService.updatePaperPartner(customer);
          throw new ConflictException('Failed, silahkan kembali dan coba lagi.');
        } else {
          console.log(error);
          throw new ConflictException(`Failed to create payment.. ${error}`);
        }
      }
    }

    // Update order
    order.description = dto.description;
    order.customer_id = dto.customer_id;
    order.fleet_id = dto.fleet_id;
    order.start_date = new Date(dto.date);
    order.duration = dto.duration;
    order.total_tax = calculatedPrice.tax;
    order.sub_total_price = calculatedPrice.sub_total;
    order.discount = calculatedPrice.discount_percentage;
    order.total_price = calculatedPrice.grand_total;
    order.service_price = dto.service_price;
    order.out_of_town_price = calculatedPrice.out_of_town_price;
    order.driver_price = calculatedPrice.total_driver_price;
    order.additional_services = calculatedPrice.additional_services;
    order.insurance_id = dto.insurance_id;

    // Update status
    if (status) {
      order.status = status;
      await this.createOrderStatusLog(order.id, status);
    }

    // Update requests
    const startRequest = order.start_request;
    if (startRequest) {
      await this.requestService.update(startRequest.id, {
        is_self_pickup: dto.start_request.is_self_pickup,
        address: dto.start_request.address,
        distance: dto.start_request.distance,
        driver_id: dto.start_request.driver_id,
      });
    }

    const endRequest = order.end_request;
    if (endRequest) {
      await this.requestService.update(endRequest.id, {
        is_self_pickup: dto.end_request.is_self_pickup,
        address: dto.end_request.address,
        distance: dto.end_request.distance,
        driver_id: dto.end_request.driver_id,
      });
    }

    // Update ledger
    await this.ledgerService.updateByOrder(order, calculatedPrice.fleet);

    // Delete unnecessary fields
    delete order.customer;
    delete order.fleet;
    delete order.insurance;
    delete order.requests;
    delete order.status_logs;

    // Save order
    await order.save({ reload: false });

    // Send email
    if (status == OrderApprovalStatusEnum.ACCEPTED) {
      await this.clearOrderCachecount();
      this.sendEmailAccept(order, calculatedPrice.fleet, customer);

      await this.pushNotifConfirmed(order.customer_id, order.id, 'approved.order');
    }

    return {
      succeed: true,
    }
  }

  private handleEmailChanges(order: OrderEntity, calculatedPrice: PriceCalculationInterface, dto: UpdateOrderDto) {
    var changes = [];

    if (order.fleet.id != dto.fleet_id) {
      changes.push(`Pergantian armada dari <b>${order.fleet.name}</b> ke <b>${calculatedPrice.fleet.name}</b>`);
    }

    if (order.start_date.toISOString() != dto.date) {
      changes.push(`Pergantian jadwal dari <b>${DateHelper.getJakartaMoment(order.start_date.toISOString()).format('DD MMMM YYYY HH:mm')}</b> ke <b>${DateHelper.getJakartaMoment(dto.date).format('DD MMMM YYYY HH:mm')}</b>`);
    }

    this.sendEmailChanges(order, changes);
  }

  async rejectOrderBulkAndDeleteCustomer(userId: number, reason: string) {
    try {
      await this.usersService.rejectUser(userId, reason);

      const pendingOrders = await this.orderRepository.find({
        where: {
          customer_id: userId,
          status: OrderApprovalStatusEnum.PENDING,
        },
      });


      if (pendingOrders.length > 0) {
        for (const order of pendingOrders) {
          try {
            await this.orderRepository.update({ id: order.id }, { status: OrderApprovalStatusEnum.REJECTED });
            await this.createOrderStatusLog(order.id, OrderApprovalStatusEnum.REJECTED, reason);
            await this.ledgerService.removeByOrderId(order.id);
            await this.sendEmailReject(order, reason);
          } catch (orderErr) {
            console.error(`Failed to process order ID ${order.id}:`, orderErr.stack || orderErr);
          }
        }
      }

      try {
        await this.clearOrderCachecount();
      } catch (cacheErr) {
        console.error('Failed to clear order cache:', cacheErr.stack || cacheErr);
      }

      return {
        succeed: true,
      };

    } catch (err) {

      return {
        succeed: false,
        error: err.message,
        detail: err.stack, 
      };
    }
  }



  async reject(id: number, dto: RejectOrderDto) {
    const order = await this.findOne(id, true);

    if (order.status !== OrderApprovalStatusEnum.PENDING) {
      throw new ConflictException('Order already accepted/rejected.');
    }

    // Update order status
    await this.orderRepository.update({ id }, { status: OrderApprovalStatusEnum.REJECTED });

    // Create order status log
    await this.createOrderStatusLog(order.id, OrderApprovalStatusEnum.REJECTED, dto.reason);

    // Send email
    this.sendEmailReject(order, dto.reason);

    // Clear cache
    await this.clearOrderCachecount();

    // Delete ledger
    await this.ledgerService.removeByOrderId(id);

    await this.pushNotifConfirmed(order.customer_id, order.id, 'rejected.order');

    return {
      succeed: true,
    }
  }

  async remove(user, id: number, dto: DeleteOrderDto) {
    const order = await this.findOne(id, true, user);
    const isForced = JSON.parse(dto.force as any) == true;

    if (order.payment_status == OrderPaymentStatusEnum.DONE && !isForced) {
      throw new ConflictException('Order sudah dibayar, tidak bisa dihapus.');
    }

    if (order.external_id) {
      try {
        const payment = await this.orderPgService.getSalesInvoice(order.external_id);

        // Validate payment status
        this.validatePaymentStatus(payment);

        // Delete payment
        await this.orderPgService.deleteSalesInvoice(order.external_id);
      } catch (error) {
        if (!isForced) {
          throw new ConflictException(error);
        }
      }
    }

    // Delete order
    await this.orderRepository.softDelete({ id });

    // Delete requests
    await this.requestService.removeByOrderId(id);

    // Delete ledger
    await this.ledgerService.removeByOrderId(id);

    // Clear cache
    await this.clearOrderCachecount();

    if (user.role == UserRoleEnum.ADMIN) {
      this.sendCustomerEmailDelete(order);
    } else if (user.role == UserRoleEnum.CUSTOMER) {
      // this.sendAdminEmailDelete(order);
      this.sendUserCancelOrder(order, user)
    }

    return {
      succeed: true,
    }
  }

  private async pushNotifConfirmed(user_id: number, order_id: number, notification_type_key: string) {
    // Mengambil token
    const token = await this.deviceTokensService.getFcmTokens(user_id);

    // Mengambil notification type
    const dataNotificationType = await this.notificationsService.getNotificationType(notification_type_key);

    // Mengambil order data
    const dataOrder = await this.orderRepository
      .createQueryBuilder('o')
      .select([
        'o.duration as duration'
        , 'f.name as car_name'
        , 'osl.description as reason'
      ])
      .leftJoin(FleetsEntity, "f", "f.id = o.fleet_id")
      .leftJoin(OrderStatusLogsEntity, "osl", "osl.order_id = o.id and osl.status = 'rejected'")
      .where('o.id = :id', { id: order_id })
      .getRawOne();

    // Pengecekan token
    if (token.length > 0) {

      // Pembuatan title
      let title = '';
      switch (notification_type_key) {
        case 'approved.order':
          title = 'Permintaan Sewa Armada Anda Telah Disetujui! 🎉';
          break;
        case 'rejected.order':
          title = 'Permintaan Sewa Armada Anda Ditolak 😔';
          break;
        default:
          break;
      }

      // Pembuatan message
      let message = dataNotificationType?.text ?? '';
      message = message.replace('{car_name}', dataOrder?.car_name ?? '-');
      message = message.replace('{duration}', dataOrder?.duration ?? '-');
      message = message.replace('{reason}', dataOrder?.reason ?? '-');

      // Pembuatan object data yang dikirim
      const dataMessage = token.map(item => {
        return {
          token: item,
          notification: {
            title: title,
            body: message,
          },
        }
      })

      // Pengiriman data fcm
      await firebase.messaging().sendEach(dataMessage);

    }

    return;
  }

  private getStatusCountByStatus(status: GetOrdersStatus) {
    const builder = this.orderRepository
      .createQueryBuilder('o')
      .select('COUNT(o.id)', 'count');

    return this.handleStatusFilter(builder, status)
      .select('COUNT(o.id)', 'count')
      .cache(ORDER_CACHE_COUNT_KEY(status), ORDER_CACHE_TTL)
      .getRawOne();
  }

  async getStatusCount() {
    const pendingStatus = await this.getStatusCountByStatus(GetOrdersStatus.PENDING);
    const onProgressStatus = await this.getStatusCountByStatus(GetOrdersStatus.ON_PROGRESS);
    const doneStatus = await this.getStatusCountByStatus(GetOrdersStatus.DONE);

    return [
      {
        status: GetOrdersStatus.PENDING,
        count: pendingStatus == null ? 0 : +pendingStatus?.count,
      },
      {
        status: GetOrdersStatus.ON_PROGRESS,
        count: onProgressStatus == null ? 0 : +onProgressStatus?.count,
      },
      {
        status: GetOrdersStatus.DONE,
        count: doneStatus == null ? 0 : +doneStatus?.count,
      }
    ];
  }

  async pgCallback(invoiceId: string, invoiceNumber?: string,) {
    if (!invoiceId) {
      throw new ConflictException('External ID is required.');
    }

    // Set delay for 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10 * 1000));

    const payment = await this.orderPgService.getSalesInvoice(invoiceId);
    const order = await this.orderRepository.findOne({
      where: invoiceNumber ? {
        invoice_number: invoiceNumber
      } : {
        external_id: invoiceId
      },
      relations: ['customer', 'fleet'],
    });

    let changes = false;
    if (payment.data.status.payment_status == 'partially paid') {
      await this.orderRepository.update({ id: order.id }, { payment_status: OrderPaymentStatusEnum.PARTIALLY_PAID });
      order.payment_status = OrderPaymentStatusEnum.PARTIALLY_PAID;

      changes = true;
    } else if (order.payment_status != OrderPaymentStatusEnum.DONE && payment.data.status.payment_status == 'paid') {
      await this.orderRepository.update({ id: order.id }, { payment_status: OrderPaymentStatusEnum.DONE });
      order.payment_status = OrderPaymentStatusEnum.DONE;

      changes = true;

      // Send email
      // this.sendEmailOrderToAdmin(order, order.fleet, order.customer);
    } else if (payment.data.status.payment_status == 'overdue') {
      await this.orderRepository.update({ id: order.id }, { payment_status: OrderPaymentStatusEnum.FAILED });
      order.payment_status = OrderPaymentStatusEnum.FAILED;

      changes = true;
    }

    // Update ledger
    await this.ledgerService.updateByOrder(order, order.fleet);

    // Clear cache
    await this.clearOrderCachecount();

    SentryHelper.captureEvent(undefined, 'pgCallback', { invoiceId, invoiceNumber, payment, order, status: payment.data.status, changes });

    return {
      succeed: true,
      changes: changes,
    }

  }

  private async clearOrderCachecount() {
    await this.dataSource.queryResultCache.remove([ORDER_CACHE_COUNT_KEY(GetOrdersStatus.PENDING), ORDER_CACHE_COUNT_KEY(GetOrdersStatus.ON_PROGRESS), ORDER_CACHE_COUNT_KEY(GetOrdersStatus.DONE)]);
  }

  private generatePaymentItems(calculatedPrice: PriceCalculationInterface, dto: Partial<CreateOrderDto>): PurchaseInvoiceItemParam[] {
    // const taxId = PPH_21_25_ID_ENV;

    let result = [
      {
        name: 'Rental Charge',
        description: 'Rental Charge',
        price: calculatedPrice.rent_price,
        quantity: dto.duration,
        // tax_id: taxId,
        discount: dto.discount,
      },
    ];

    if (calculatedPrice.insurance && calculatedPrice.insurance_price !== 0) {
      result.push({
        name: 'Insurance Charge',
        description: calculatedPrice.insurance.name,
        price: calculatedPrice.insurance_price,
        quantity: 1,
        // tax_id: taxId,
        discount: 0,
      });
    }

    if (calculatedPrice.service_price !== 0) {
      result.push({
        name: 'Service Charge',
        description: 'Tambahan biaya layanan',
        price: calculatedPrice.service_price,
        quantity: 1,
        // tax_id: taxId,
        discount: 0,
      });
    }

    if (calculatedPrice.total_weekend_price !== 0) {
      const qty = calculatedPrice.weekend_days.length;

      result.push({
        name: 'Weekend Charge',
        description: 'Tambahan biaya weekend',
        price: calculatedPrice.weekend_price,
        quantity: qty,
        // tax_id: taxId,
        discount: 0,
      });
    }

    if (calculatedPrice.total_driver_price !== 0) {
      result.push({
        name: 'Driver Charge',
        description: `Tambahan biaya driver${dto.is_out_of_town ? ' luar kota' : ''}`,
        price: calculatedPrice.driver_price,
        quantity: dto.duration,
        // tax_id: taxId,
        discount: 0,
      });
    }

    if (calculatedPrice.out_of_town_price !== 0) {
      result.push({
        name: 'Out of Town Charge',
        description: 'Tambahan biaya luar kota',
        price: calculatedPrice.out_of_town_price,
        quantity: 1,
        // tax_id: taxId,
        discount: 0,
      });
    }

    if (calculatedPrice.additional_services.length > 0) {
      calculatedPrice.additional_services.forEach(service => {
        result.push({
          name: 'Biaya Layanan',
          description: service.name,
          price: service.price,
          quantity: 1,
          // tax_id: taxId,
          discount: 0,
        });
      });
    }

    return result;
  }

  private validatePaymentStatus(payment: SalesInvoiceCreateResponse) {
    if (payment.data.status.payment_status === 'paid') {
      throw new UnprocessableEntityException('Order already paid, cannot be updated.');
    }
  }

  private validateCustomerContact(customer: UserEntity) {
    if (!customer.phone_number) {
      throw new UnprocessableEntityException('Customer phone number is required.');
    } else if (!customer.email) {
      throw new UnprocessableEntityException('Customer email is required.');
    }
  }

  private async validateFleetAvailability(
    fleetId: number,
    dateString: string,
    duration: number,
    orderId?: number,
  ) {
    const startDate = new Date(dateString);
    const endDate = DateHelper.addDays(startDate, duration);

    const orderBuilder = await this.orderRepository.createQueryBuilder('o')
      .where('o.fleet_id = :fleetId', { fleetId })
      .leftJoin('o.requests', 'request_pickup', 'request_pickup.type = :pickupType', {
        pickupType: RequestTypeEnum.PICK_UP
      })
      // Check if fleet is already booked
      .andWhere(`(o.start_date < :endDate AND (o.start_date + make_interval(days => o.duration)) > :startDate)`, {
        startDate,
        endDate,
      })
      // And not done, if done then it's already finished, so the count is 0
      .andWhere(`request_pickup.status != '${RequestStatusEnum.DONE}'`)
      .andWhere(`o.status != '${OrderApprovalStatusEnum.REJECTED}'`);

    if (orderId) {
      orderBuilder.andWhere('o.id != :orderId', { orderId });
    }

    const orderCount = await orderBuilder.getCount();
    if (orderCount > 0) {
      throw new UnprocessableEntityException({
        message: 'Fleet already booked.',
        error: 'Unprocessable Entity',
        statusCode: 422,
        code: 'fleet_already_booked',
      });
    }

    if (!orderId) {
      const jakartaNow = DateHelper.getJakartaMoment(new Date().toISOString());
      const jakartaDate = DateHelper.getJakartaMoment(dateString);

      if (jakartaDate.isBefore(jakartaNow, 'day')) {
        throw new UnprocessableEntityException('Tidak bisa memesan armada di hari yang sudah lewat.');
      }
    }
  }

  private async validateUsers(customerId: number, driverId: number | number[]) {
    // Validate customer and driver
    await this.requestService.validateCustomerDriver(customerId, driverId);

    // Validate is user verified
    await this.requestService.validateIsCustomerVerified(customerId);
  }

  private async sendCustomerEmailDelete(order: OrderEntity) {
    await this.mailService.sendMail({
      to: order.customer.email,
      subject: 'Permintaan Sewa Anda Telah Dicancel oleh Admin!',
      customerName: order.customer.name,
      message: CUSTOMER_CANCEL_MESSAGE(order.fleet.type_label, order.fleet.name, order.duration.toString(), DateHelper.getJakartaMoment(order.end_date?.toISOString()).format('DD MMMM YYYY HH:mm'), DateHelper.getJakartaMoment(order.start_date.toISOString()).format('DD MMMM YYYY HH:mm')),
    });

    await this.qontakService.sendMessage({
      to: order.customer.phone_number,
      customerName: order.customer.name,
      message: QONTAK_CANCEL_ORDER(
        order.fleet.type_label, order.fleet.name, order.duration.toString(),
        DateHelper.getJakartaMoment(order.end_date?.toISOString()).format('DD MMMM YYYY HH:mm'),
        DateHelper.getJakartaMoment(order.start_date.toISOString()).format('DD MMMM YYYY HH:mm')
      ),
    })
  }

  private async sendAdminEmailDelete(order: OrderEntity) {
    await this.mailService.sendMail({
      to: process.env.EMAIL_USERNAME,
      subject: `${order.customer.name} Telah Melakukan Cancel Atas Sewa ${order.fleet.name}`,
      customerName: 'Admin',
      message: ADMIN_CANCEL_MESSAGE(order.customer.name, order.fleet.type_label, order.fleet.name, order.duration.toString(), DateHelper.getJakartaMoment(order.end_date?.toISOString()).format('DD MMMM YYYY HH:mm'), DateHelper.getJakartaMoment(order.start_date.toISOString()).format('DD MMMM YYYY HH:mm')),
      buttonName: 'Lihat Calendar Transgo',
      buttonLink: `${process.env.ADMIN_URL}/dashboard/calendar`,
    });
  }

  private async sendUserCancelOrder(order: OrderEntity, customer: UserEntity) {
    await this.qontakService.sendMessage({
      to: customer.phone_number,
      customerName: customer.name,
      message: QONTAK_CANCEL_ORDER_CONFIRMATION(order.customer.name, order.fleet.type_label, order.fleet.name, order.duration.toString(), DateHelper.getJakartaMoment(order.start_date.toISOString()).format('DD MMMM YYYY HH:mm'), DateHelper.getJakartaMoment(order.end_date.toISOString()).format('DD MMMM YYYY HH:mm'))
    })
  }

  private async sendEmailAccept(order: OrderEntity, fleet: FleetsEntity, customer: UserEntity) {
    await this.mailService.sendMail({
      to: customer.email,
      subject: 'Permintaan Sewa Anda Telah Disetujui Oleh Admin!',
      customerName: customer.name,
      message: ACCEPTED_ORDER_MESSAGE(fleet.type_label, fleet.name, order.duration.toString()),
      buttonName: 'Lihat Detail Sewa',
      buttonLink: `${process.env.FRONTEND_URL}/sewa/riwayat/${order.id}/detail`,
      customSupportText: ACCEPTED_ORDER_SUPPORT_TEXT,
    });

    await this.qontakService.sendMessage({
      to: customer.phone_number,
      customerName: customer.name,
      message: QONTAK_ACCEPTED_ORDER_USER(
        fleet.type_label, fleet.name, order.duration.toString(),
        `${process.env.FRONTEND_URL}/sewa/riwayat/${order.id}/detail`
      ),
    })

    if (fleet.owner != null) {
      await this.qontakService.sendMessage({
        to: fleet.owner.phone_number,
        customerName: fleet.owner.name,
        message: QONTAK_ACCEPTED_ORDER_OWNER(
          fleet.owner.name, fleet.type_label, fleet.name,
          customer.name, order.duration.toString(),
        ),
      })
    }
  }

  private async sendEmailReject(order: OrderEntity, reason: string) {
    await this.mailService.sendMail({
      to: order.customer.email,
      subject: 'Permintaan Sewa Anda Telah Ditolak Oleh Admin!',
      customerName: order.customer.name,
      message: REJECTED_ORDER_MESSAGE(order.fleet.type_label, order.fleet.name, order.duration.toString(), reason),
      buttonName: 'Lihat Detail Sewa',
      buttonLink: `${process.env.FRONTEND_URL}/sewa/riwayat/${order.id}/detail`,
      customSupportText: REJECTED_ORDER_SUPPORT_TEXT,
    });

    await this.qontakService.sendMessage({
      to: order.customer.phone_number,
      customerName: order.customer.name,
      message: QONTAK_REJECTED_ORDER(
        order.fleet.type_label, order.fleet.name, order.duration.toString(), reason,
        `${process.env.FRONTEND_URL}/sewa/riwayat/${order.id}/detail`
      ),
    })
  }

  private async sendEmailChanges(order: OrderEntity, changes: string[]) {

    const email = order.customer.email
    const phone_number = order.customer.phone_number
    const name = order.customer.name
    const id = order.id

    await this.qontakService.sendMessage({
      to: phone_number,
      customerName: name,
      message: QONTAK_CHANGES_ORDER_MESSAGE(
        changes,
        `${process.env.FRONTEND_URL}/sewa/riwayat/${id}/detail`
      ),
    })

    await this.mailService.sendMail({
      to: email,
      subject: 'Detail Permintaan Sewa Anda Telah Diubah oleh Admin!',
      customerName: name,
      message: CHANGES_ORDER_MESSAGE(changes),
      buttonName: 'Lihat Permintaan Sewa',
      buttonLink: `${process.env.FRONTEND_URL}/sewa/riwayat/${id}/detail`,
      customSupportText: ACCEPTED_ORDER_SUPPORT_TEXT,
    });
  }

  private async sendEmailOrderToAdmin(order: OrderEntity, fleet: FleetsEntity, customer: UserEntity) {
    await this.mailService.sendMail({
      to: process.env.EMAIL_USERNAME,
      subject: `${customer.name} Telah Melakukan Transfer Atas Sewa ${fleet.name} #${order.invoice_number}`,
      customerName: 'Admin',
      message: PAID_ORDER_ADMIN_MESSAGE(customer.name, fleet.type_label, fleet.name, order.duration.toString()),
      buttonName: 'Lihat Detail Sewa',
      buttonLink: `${process.env.ADMIN_URL}/dashboard/orders/${order.id}/detail`,
    });
  }

  private async createOrderStatusLog(orderId: number, status: OrderApprovalStatusEnum, description?: string) {
    await this.orderStatusLogsService.create(new OrderStatusLogsEntity({
      order_id: orderId,
      status: status,
      description: description,
    }));
  }
}
