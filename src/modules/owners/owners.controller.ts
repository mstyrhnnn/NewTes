import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleTypes } from 'src/config/auth/role/role.decorator';
import { RoleType } from 'src/config/auth/role/role.enum';
import { RoleGuard } from 'src/config/auth/role/role.guard';
import { JwtAuthGuard } from 'src/config/guard/jwt-auth.guard';
import { GetOwnerPaginationDto } from './dto/get-owner-pagination.dto';

@Controller({
  version: '1',
  path: 'owners',
})
@ApiTags('v1/owners')
export class OwnersController {

  constructor(private readonly ownersService: OwnersService) { }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Post()
  create(@Body() createOwnerDto: CreateOwnerDto) {
    return this.ownersService.create(createOwnerDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Get()
  findAll(@Query() dto: GetOwnerPaginationDto) {
    return this.ownersService.findAll(dto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ownersService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOwnerDto: UpdateOwnerDto) {
    return this.ownersService.update(+id, updateOwnerDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ownersService.remove(+id);
  }
}
