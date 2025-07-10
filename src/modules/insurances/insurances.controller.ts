import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InsurancesService } from './insurances.service';
import { GetInsurancesPaginationDto } from './dto/get-insurancse-pagination.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/config/guard/jwt-auth.guard';
import { RoleGuard } from 'src/config/auth/role/role.guard';
import { RoleTypes } from 'src/config/auth/role/role.decorator';
import { RoleType } from 'src/config/auth/role/role.enum';
import { BasicOrJwtAuthGuard } from 'src/config/guard/basic-jwt-auth.guard';

@Controller({
  version: '1',
  path: 'insurances',
})
@ApiTags('v1/insurances')
export class InsurancesController {

  constructor(
    private readonly orderInsurancesService: InsurancesService,
  ) { }

  @UseGuards(BasicOrJwtAuthGuard)
  @ApiBearerAuth()
  @ApiBasicAuth()
  @Get()
  findAll(
    @Query() dto: GetInsurancesPaginationDto
  ) {
    return this.orderInsurancesService.findAll(new GetInsurancesPaginationDto(dto));
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN, RoleType.CUSTOMER)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderInsurancesService.findOne(+id);
  }
}
