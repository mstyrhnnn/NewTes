import { Injectable } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { GetDriverPaginationDto } from './dto/get-driver-pagination.dto';
import { UserRoleEnum } from 'src/modules/users/enums/user.role.enum.ts';
import { UserStatusEnum } from '../users/enums/user.status.enum';

@Injectable()
export class DriversService {
  constructor(private usersService: UsersService) {}

  async create(dto: CreateDriverDto) {
    return this.usersService.create(
      new UserEntity({
        ...dto,
        role: UserRoleEnum.DRIVER,
        status: UserStatusEnum.VERIFIED,
      }),
    );
  }

  findAll(dto: GetDriverPaginationDto) {
    return this.usersService.get(
      dto.page,
      dto.limit,
      UserRoleEnum.DRIVER,
      dto.q,
      true,
    );
  }

  findOne(id: number) {
    return this.usersService.findOne(id, true);
  }

  update(id: number, updateDriverDto: UpdateDriverDto) {
    return this.usersService.update(id, new UserEntity(updateDriverDto));
  }

  remove(id: number) {
    return this.usersService.remove(id);
  }
}
