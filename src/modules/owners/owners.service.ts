import { Injectable } from '@nestjs/common';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { UserRoleEnum } from '../users/enums/user.role.enum';
import { UserStatusEnum } from '../users/enums/user.status.enum';
import { GetOwnerPaginationDto } from './dto/get-owner-pagination.dto';

@Injectable()
export class OwnersService {

  constructor(
    private usersService: UsersService,
  ) { }

  async create(dto: CreateOwnerDto) {
    return this.usersService.create(new UserEntity({
      ...dto,
      role: UserRoleEnum.OWNER,
      status: UserStatusEnum.VERIFIED,
    }));
  }

  findAll(dto: GetOwnerPaginationDto) {
    return this.usersService.get(dto.page, dto.limit, UserRoleEnum.OWNER, dto.q, true);
  }

  findOne(id: number) {
    return this.usersService.findOne(id, true);
  }

  update(id: number, updateOwnerDto: UpdateOwnerDto) {
    return this.usersService.update(id, new UserEntity(updateOwnerDto));
  }

  remove(id: number) {
    return this.usersService.remove(id);
  }
}
