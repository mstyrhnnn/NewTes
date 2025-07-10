import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { LedgersService } from './ledgers.service';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleTypes } from 'src/config/auth/role/role.decorator';
import { RoleType } from 'src/config/auth/role/role.enum';
import { RoleGuard } from 'src/config/auth/role/role.guard';
import { JwtAuthGuard } from 'src/config/guard/jwt-auth.guard';
import { GetLedgerFleetDto } from './dto/get-ledger-fleet.dto';
import { GetLedgerRecapDto } from './dto/get-ledger-recap.dto';
import { GetLedgerCategoriesDto } from './dto/get-ledger-categories.dto';

@Controller({
  version: '1',
  path: 'ledgers',
})
@ApiTags('v1/ledgers')
export class LedgersController {

  constructor(private readonly ledgersService: LedgersService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  create(@Body() createLedgerDto: CreateLedgerDto) {
    return this.ledgersService.create(createLedgerDto);
  }

  @Get('recaps')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.OWNER)
  @ApiBearerAuth()
  findRecap(
    @Request() req,
    @Query() dto: GetLedgerRecapDto,
  ) {
    return this.ledgersService.findRecap(req.user, new GetLedgerRecapDto(dto));
  }

  @Get('recaps/fleets')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN, RoleType.OWNER)
  @ApiBearerAuth()
  findFleetsRecap(
    @Request() req,
    @Query() dto: GetLedgerFleetDto,
  ) {
    return this.ledgersService.findFleetsRecap(req.user, new GetLedgerRecapDto(dto));
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  getCategories(
    @Query() dto: GetLedgerCategoriesDto,
  ) {
    return this.ledgersService.getCategories(new GetLedgerCategoriesDto(dto));
  }

  @Get('fleet/:fleet_id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN, RoleType.OWNER)
  @ApiBearerAuth()
  findRecapFleet(
    @Request() req,
    @Param('fleet_id') fleetId: string,
    @Query() dto: GetLedgerFleetDto,
  ) {
    return this.ledgersService.findFleetRecap(req.user, +fleetId, new GetLedgerFleetDto(dto));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateLedgerDto: UpdateLedgerDto) {
    return this.ledgersService.update(+id, updateLedgerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.ledgersService.remove(+id);
  }
}
