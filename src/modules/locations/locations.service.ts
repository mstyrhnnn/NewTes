import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LocationEntity } from './entities/location.entity';
import { Brackets, Repository } from 'typeorm';
import { GetLocationPaginationDto } from './dto/get-location-pagination.dto';
import { PaginationHelper } from 'src/config/helper/pagination/pagination.helper';

@Injectable()
export class LocationsService {

  constructor(
    @InjectRepository(LocationEntity) private locationRepository: Repository<LocationEntity>,
  ) { }

  create(createLocationDto: CreateLocationDto) {
    return this.locationRepository.save(createLocationDto);
  }

  findAll(dto: GetLocationPaginationDto) {
    const builder = this.locationRepository.createQueryBuilder('l')
      .orderBy('l.id', 'ASC');

    if (dto.q && dto.q !== '') {
      builder
        .andWhere(new Brackets(qb => {
          qb.where('LOWER(l.name) LIKE LOWER(:q)', { q: `%${dto.q}%` });
        }));
    }

    return PaginationHelper.pagination(builder, dto);
  }

  async findOne(id: number) {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location) {
      throw new NotFoundException(`Location with id ${id} not found`);
    }
    return location;
  }

  async update(id: number, updateLocationDto: UpdateLocationDto) {
    const location = await this.findOne(id);

    location.name = updateLocationDto.name;
    location.location = updateLocationDto.location;
    location.address = updateLocationDto.address;
    location.map_url = updateLocationDto.map_url;
    location.redirect_url = updateLocationDto.redirect_url;

    return this.locationRepository.save(location);
  }

  remove(id: number) {
    return this.locationRepository.softDelete({ id });
  }
}
