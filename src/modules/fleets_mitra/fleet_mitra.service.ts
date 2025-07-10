import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FleetMitra } from './entities/fleet_mitra.entity';
import { CreateFleetDto } from './dto/create-fleet.dto';
import { UpdateFleetDto } from './dto/update-fleet.dto';
import { GetFleetPaginationDto } from './dto/get-fleet-pagination.dto';

import { UserEntity } from '../users/entities/user.entity';
import { UserRoleEnum } from '../users/enums/user.role.enum.ts';

@Injectable()
export class FleetMitraService {
  constructor(
    @InjectRepository(FleetMitra)
    private readonly fleetRepo: Repository<FleetMitra>,

    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateFleetDto): Promise<FleetMitra> {
    const fleet = this.fleetRepo.create(dto);
    return this.fleetRepo.save(fleet);
  }

  async findAll(query: GetFleetPaginationDto): Promise<{ data: any[]; total: number; page: number; limit: number; }> {
    const { page = 1, limit = 10, q } = query;

    const qb = this.fleetRepo.createQueryBuilder('fleet')
      .leftJoinAndMapOne(
        'fleet.driver',
        UserEntity,
        'driver',
        'driver.id = fleet.driver_id AND driver.role = :role',
        { role: UserRoleEnum.GOJEK },
      );

    if (q) {
      qb.where(
        'fleet.fleet_name ILIKE :q OR fleet.number_plate ILIKE :q',
        { q: `%${q}%` },
      );
    }

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('fleet.id', 'DESC');

    const [fleets, total] = await qb.getManyAndCount();

    const data = fleets.map(({ driver, ...fleet }) => ({
      ...fleet,
      name: driver?.name ?? null,
    }));

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<any | null> {
    const fleet = await this.fleetRepo.createQueryBuilder('fleet')
      .leftJoinAndMapOne(
        'fleet.driver',
        UserEntity,
        'driver',
        'driver.id = fleet.driver_id AND driver.role = :role',
        { role: UserRoleEnum.GOJEK },
      )
      .where('fleet.id = :id', { id })
      .getOne();

    if (!fleet) return null;

    const { driver, ...fleetData } = fleet;

    return {
      ...fleetData,
      name: driver?.name ?? null,
    };
  }

  async update(id: number, dto: UpdateFleetDto): Promise<any | null> {
    await this.fleetRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.fleetRepo.softDelete(id);
  }
}
