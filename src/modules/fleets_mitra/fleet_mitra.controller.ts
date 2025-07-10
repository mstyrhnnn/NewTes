import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { FleetMitraService } from './fleet_mitra.service';
import { CreateFleetDto } from './dto/create-fleet.dto';
import { UpdateFleetDto } from './dto/update-fleet.dto';
import { GetFleetPaginationDto } from './dto/get-fleet-pagination.dto';
import { RoleTypes } from 'src/config/auth/role/role.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/config/guard/jwt-auth.guard';
import { RoleGuard } from 'src/config/auth/role/role.guard';
import { RoleType } from 'src/config/auth/role/role.enum';

@Controller({
  version: '1',
  path: 'fleet-mitra',
})

@Controller('fleet-mitra')

@UseGuards(JwtAuthGuard, RoleGuard)
@RoleTypes(RoleType.ADMIN)
@ApiBearerAuth()

export class FleetMitraController {
  constructor(private readonly service: FleetMitraService) {}

  @Post()
  create(@Body() dto: CreateFleetDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: GetFleetPaginationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateFleetDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
