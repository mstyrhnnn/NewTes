import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { CreateDriverMitraDto } from './dto/create-driver_mitra.dto';
import { UpdateDriverMitraDto } from './dto/update-driver_mitra.dto';
import { GetDriverPaginationDto } from '../drivers/dto/get-driver-pagination.dto';

import { FleetMitra } from '../fleets_mitra/entities/fleet_mitra.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UserRoleEnum } from '../users/enums/user.role.enum.ts';

@Injectable()
export class DriverMitraService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    @InjectRepository(FleetMitra)
    private readonly fleetMitraRepo: Repository<FleetMitra>,
  ) {}

  private formatPhoneNumber(phone: string): string {
    if (!phone) return phone;

    phone = phone.trim();
    if (phone.startsWith('08')) {
      return '62' + phone.substring(1);
    }
    return phone;
  }

  async create(dto: CreateDriverMitraDto): Promise<UserEntity> {
    const formattedPhone = this.formatPhoneNumber(dto.phone_number);

    const existing = await this.usersRepository.findOne({
      where: { phone_number: formattedPhone, role: UserRoleEnum.GOJEK },
    });

    if (existing) {
      throw new BadRequestException(
        `Terjadi kesalahan, nomor telah digunakan oleh driver ${existing.name}`
      );
    }

    const user = this.usersRepository.create({
      ...dto,
      phone_number: formattedPhone, 
      role: UserRoleEnum.GOJEK,
    });

    return this.usersRepository.save(user);
  }

  async findAll(query: GetDriverPaginationDto): Promise<{ data: UserEntity[]; total: number; page: number; limit: number;}> {
    const { page = 1, limit = 10, q } = query;

    const qb = this.usersRepository.createQueryBuilder('user')
      .addSelect('user.photo_profile')
      .where('user.role = :role', { role: UserRoleEnum.GOJEK });

    if (q) {
      qb.andWhere(
        '(user.full_name ILIKE :q OR user.phone_number ILIKE :q)',
        { q: `%${q}%` },
      );
    }

    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.id', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<UserEntity> {
     const user = await this.usersRepository.createQueryBuilder('user')
      .addSelect('user.photo_profile')
      .where({ id, role: UserRoleEnum.GOJEK })
      .getOne();

    if (!user) {
      throw new NotFoundException('Driver not found');
    }

    return user;
  }

  async update(id: number, dto: UpdateDriverMitraDto): Promise<UserEntity> {
    const driver = await this.findOne(id);

    if (dto.phone_number) {
      const formattedPhone = this.formatPhoneNumber(dto.phone_number);

      if (formattedPhone !== driver.phone_number) {
        const existing = await this.usersRepository.findOne({
          where: {
            phone_number: formattedPhone,
            role: UserRoleEnum.GOJEK,
            id: Not(id), 
          },
        });

        if (existing) {
          throw new BadRequestException(
            `Terjadi kesalahan, nomor telah digunakan oleh ${existing.name}`
          );
        }

        dto.phone_number = formattedPhone;
      }
    }

    Object.assign(driver, dto);
    return this.usersRepository.save(driver);
  }

  async remove(id: number): Promise<void> {
    const driver = await this.findOne(id);

    await this.fleetMitraRepo
      .createQueryBuilder()
      .update(FleetMitra)
      .set({ driver_id: null })
      .where('driver_id = :id', { id })
      .execute();
    await this.usersRepository.softRemove(driver);
  }

  async findUnassignedDrivers(): Promise<UserEntity[]> {
    const assignedDriverIds = await this.fleetMitraRepo
      .createQueryBuilder('fleet')
      .select('fleet.driver_id', 'driver_id')
      .where('fleet.driver_id IS NOT NULL')
      .getRawMany();

    const ids = assignedDriverIds.map((item) => item.driver_id);

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRoleEnum.GOJEK });

    if (ids.length) {
      qb.andWhere('user.id NOT IN (:...ids)', { ids });
    }

    return qb.getMany();
  }
}
