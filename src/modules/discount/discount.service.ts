import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DiscountEntity } from "./entities/discount.entity";
import { Repository } from "typeorm";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { GetDiscountPaginationDto } from "./dto/get-discount-pagination.dto";
import { PaginationHelper } from "src/config/helper/pagination/pagination.helper";
import { UpdateDiscountDto } from "./dto/update-discount.dto";
import { LocationEntity } from "../locations/entities/location.entity";
import { isNumber } from "class-validator";
import { FleetsEntity } from "../fleets/entities/fleet.entity";

@Injectable()
export class DiscountService {
    constructor(
        @InjectRepository(DiscountEntity) private readonly discountRepository: Repository<DiscountEntity>,
        @InjectRepository(LocationEntity) private readonly locationRepository: Repository<LocationEntity>,
        @InjectRepository(FleetsEntity) private readonly fleetRepository: Repository<FleetsEntity>,
    ) { }

    create(dto: CreateDiscountDto) {
        if (dto.discount < 0 || dto.discount > 100) {
            throw new InternalServerErrorException('Discount must be between 0 and 100');
        }

        if (!dto.location_id) {
            dto.location_id = 0;
        }

        if (['car', 'motorcycle'].indexOf(dto.fleet_type) == -1) {
            dto.fleet_type = 'all';
        }

        return this.discountRepository.save(dto);
    }

    findAll(dto: GetDiscountPaginationDto) {
        if (!dto.page) dto = new GetDiscountPaginationDto();

        const builder = this.discountRepository.createQueryBuilder('d')
            .orderBy('d.id', 'DESC');

        return PaginationHelper.pagination(builder, {
            page: dto.page,
            limit: dto.limit,
        });
    }

    async findOne(date: string | Date, location_id: number = 0, fleet_type: string = 'all') {
        if (isNaN(Date.parse(date as string)) == true) {
            throw new InternalServerErrorException('Invalid date format');
        }

        date = new Date(date);

        const builder = this.discountRepository.createQueryBuilder('d')
            .where('d.start_date <= :date', { date })
            .andWhere('d.end_date >= :date', { date });

        const [foundLocation, foundFleet] = await Promise.all([
            this.discountRepository.createQueryBuilder('d')
                .where('d.start_date <= :date', { date })
                .andWhere('d.end_date >= :date', { date })
                .andWhere('d.location_id = :loc', { loc: location_id })
                .getOne(),
            this.discountRepository.createQueryBuilder('d')
                .where('d.start_date <= :date', { date })
                .andWhere('d.end_date >= :date', { date })
                .andWhere('d.fleet_type = :flt', { flt: fleet_type })
                .getOne()
        ]);

        builder.andWhere('d.fleet_type = :flt', { flt: foundFleet ? fleet_type : 'all' });
        builder.andWhere('d.location_id = :loc', { loc: (foundLocation && !foundFleet) ? location_id : 0 });

        builder.orderBy('d.discount', 'DESC');

        const discount = await builder.getOne();
        if (!discount) {
            return {
                discount: 0
            };
        }

        return new DiscountEntity({
            discount: discount.discount,
            start_date: discount.start_date,
            end_date: discount.end_date,
        });
    }

    async update(id: number, dto: UpdateDiscountDto) {
        const discount = await this.discountRepository.findOneBy({ id });
        if (!discount) {
            throw new NotFoundException('Discount not found');
        }

        if (dto.discount < 0 || dto.discount > 100) {
            throw new InternalServerErrorException('Discount must be between 0 and 100');
        }

        discount.start_date = new Date(dto.start_date);
        discount.end_date = new Date(dto.end_date);

        return this.discountRepository.save({ ...discount, ...dto });
    }

    remove(id: number) {
        console.log('id', id);
        return this.discountRepository.delete({ id });
    }
}