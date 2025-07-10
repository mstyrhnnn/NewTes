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
  Request,
  Put,
} from '@nestjs/common';
import { FleetsService } from './fleets.service';
import { CreateFleetDto } from './dto/create-fleet.dto';
import { UpdateFleetDto } from './dto/update-fleet.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetFleetPaginationDto } from './dto/get-fleet-pagination.dto';
import { JwtAuthGuard } from 'src/config/guard/jwt-auth.guard';
import { RoleGuard } from 'src/config/auth/role/role.guard';
import { RoleType } from 'src/config/auth/role/role.enum';
import { RoleTypes } from 'src/config/auth/role/role.decorator';
import { GetFleetAvailabilityPaginationDto } from './dto/get-fleet-availability-pagination.dto';
import { BasicOrJwtAuthGuard } from 'src/config/guard/basic-jwt-auth.guard';
import { GetFleetCalendarPaginationDto } from './dto/get-fleet-calendar-pagination.dto';

@Controller({
  version: '1',
  path: 'fleets',
})
@ApiTags('v1/fleets')
export class FleetsController {
  constructor(private readonly fleetsService: FleetsService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Post()
  create(@Body() createFleetDto: CreateFleetDto) {
    return this.fleetsService.create(createFleetDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN, RoleType.DRIVER, RoleType.OWNER)
  @ApiBearerAuth()
  @Get()
  findAll(@Request() req, @Query() dto: GetFleetPaginationDto) {
    return this.fleetsService.findAll(req.user, dto);
  }

  @Get('available')
  @UseGuards(BasicOrJwtAuthGuard)
  @ApiBasicAuth()
  @ApiBearerAuth()
  findAvailableFleets(@Query() dto: GetFleetAvailabilityPaginationDto) {
    return this.fleetsService.findAvailableFleets(dto);
  }

  @Get('slugs')
  @UseGuards(BasicOrJwtAuthGuard)
  @ApiBasicAuth()
  @ApiBearerAuth()
  findSlugs() {
    return this.fleetsService.findSlugs();
  }

  @Get('calendar')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth()
  @RoleTypes(RoleType.ADMIN, RoleType.OWNER)
  findCalendar(@Request() req, @Query() dto: GetFleetCalendarPaginationDto) {
    return this.fleetsService.findCalendar(
      req.user,
      new GetFleetCalendarPaginationDto(dto),
    );
  }

  @UseGuards(BasicOrJwtAuthGuard)
  @ApiBasicAuth()
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fleetsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFleetDto: UpdateFleetDto) {
    return this.fleetsService.update(+id, updateFleetDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fleetsService.remove(+id);
  }
}
