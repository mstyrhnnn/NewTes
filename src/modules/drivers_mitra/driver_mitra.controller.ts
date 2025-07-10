import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DriverMitraService } from './driver_mitra.service';
import { CreateDriverMitraDto } from './dto/create-driver_mitra.dto';
import { UpdateDriverMitraDto } from './dto/update-driver_mitra.dto';
import { GetDriverPaginationDto } from '../drivers/dto/get-driver-pagination.dto';
import { JwtAuthGuard } from 'src/config/guard/jwt-auth.guard';
import { RoleTypes } from 'src/config/auth/role/role.decorator';
import { RoleType } from 'src/config/auth/role/role.enum';
import { RoleGuard } from 'src/config/auth/role/role.guard';

@Controller({
  version: '1',
  path: 'driver_mitra',
})
@ApiTags('v1/driver_mitra')
@UseGuards(JwtAuthGuard, RoleGuard)
@RoleTypes(RoleType.CUSTOMER)
@ApiBearerAuth()

export class DriverMitraController {
  constructor(private readonly service: DriverMitraService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Post()
  create(@Body() dto: CreateDriverMitraDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: GetDriverPaginationDto) {
    return this.service.findAll(query);
  }

  @Get('unassigned')
  findUnassignedDrivers() {
    return this.service.findUnassignedDrivers();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid ID');
    }

    return this.service.findOne(parsedId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDriverMitraDto) {
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid ID');
    }

    return this.service.update(parsedId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid ID');
    }

    return this.service.remove(parsedId);
  }
}
