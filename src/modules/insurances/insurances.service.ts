import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceEntity } from './entities/insurances.entity';
import { GetInsurancesPaginationDto } from './dto/get-insurancse-pagination.dto';
import { PaginationHelper } from 'src/config/helper/pagination/pagination.helper';

@Injectable()
export class InsurancesService {

    constructor(
        @InjectRepository(InsuranceEntity) private readonly insurancesRepository: Repository<InsuranceEntity>,
    ) { }

    async findOne(id: number) {
        return this.insurancesRepository.findOne({ where: { id } });
    }

    async findAll(dto: GetInsurancesPaginationDto) {
        const builder = this.insurancesRepository.createQueryBuilder('i');

        if (dto.q) {
            builder.where('i.name LIKE :q OR i.description LIKE :q', { q: `%${dto.q}%` });
        }

        return PaginationHelper.pagination(builder, dto);
    }
}
