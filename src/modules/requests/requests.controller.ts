import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { RequestsService } from './services/requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetRequestPaginationDto } from './dto/get-request-pagination.dto';
import { RoleTypes } from 'src/config/auth/role/role.decorator';
import { RoleType } from 'src/config/auth/role/role.enum';
import { JwtAuthGuard } from 'src/config/guard/jwt-auth.guard';
import { RoleGuard } from 'src/config/auth/role/role.guard';
import { CreateRequestLogDto } from './dto/create-request-log.dto';
import { GetRequestOneDto } from './dto/get-request-one.dto';

@Controller({
  version: '1',
  path: 'requests',
})
@ApiTags('v1/requests')
export class RequestsController {

  constructor(private readonly requestsService: RequestsService) { }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Post()
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.DRIVER)
  @ApiBearerAuth()
  @Post(':id/log')
  logStart(@Param('id') id: string, @Body() dto: CreateRequestLogDto, @Request() req) {
    return this.requestsService.log(req.user, +id, dto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Get()
  findAll(@Query() dto: GetRequestPaginationDto) {
    return this.requestsService.findAll(dto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Get('status/count')
  getStatusCount() {
    return this.requestsService.getStatusCount();
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.DRIVER)
  @ApiBearerAuth()
  @Get('driver')
  findByDriver(@Query() dto: GetRequestPaginationDto, @Request() req) {
    return this.requestsService.findAll(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.DRIVER, RoleType.ADMIN)
  @ApiBearerAuth()
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query() dto: GetRequestOneDto,
  ) {
    return this.requestsService.findOne(+id, new GetRequestOneDto(dto));
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestsService.update(+id, updateRequestDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestsService.remove(+id);
  }
}
