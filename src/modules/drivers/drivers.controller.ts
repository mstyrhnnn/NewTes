import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetDriverPaginationDto } from './dto/get-driver-pagination.dto';
import { JwtAuthGuard } from 'src/config/guard/jwt-auth.guard';
import { RoleGuard } from 'src/config/auth/role/role.guard';
import { RoleTypes } from 'src/config/auth/role/role.decorator';
import { RoleType } from 'src/config/auth/role/role.enum';

@Controller({
  version: '1',
  path: 'drivers',
})
@ApiTags('v1/drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN, RoleType.DRIVER)
  @ApiBearerAuth()
  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN, RoleType.DRIVER)
  @ApiBearerAuth()
  @Get()
  findAll(@Query() dto: GetDriverPaginationDto) {
    return this.driversService.findAll(new GetDriverPaginationDto(dto));
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN, RoleType.DRIVER)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(+id, updateDriverDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driversService.remove(+id);
  }
}
