import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, Put, InternalServerErrorException } from '@nestjs/common';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/config/guard/jwt-auth.guard';
import { RoleGuard } from 'src/config/auth/role/role.guard';
import { RoleType } from 'src/config/auth/role/role.enum';
import { RoleTypes } from 'src/config/auth/role/role.decorator';
import { BasicOrJwtAuthGuard } from 'src/config/guard/basic-jwt-auth.guard';
import { DiscountService } from './discount.service';
import { GetDiscountPaginationDto } from './dto/get-discount-pagination.dto';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { query } from 'express';


@Controller({
    version: '1',
    path: 'discount',
})
@ApiTags('v1/discount')
export class DiscountController {

    constructor(
        private readonly discountService: DiscountService,
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @RoleTypes(RoleType.ADMIN, RoleType.OWNER)
    @ApiBearerAuth()
    findAll(
        @Query() dto: GetDiscountPaginationDto
    ) {
        return this.discountService.findAll(dto);
    }

    @Get('search')
    @UseGuards(BasicOrJwtAuthGuard)
    @ApiBasicAuth()
    findOne(
        @Query('date') date: Date,
        @Query('location_id') location_id: number = 0,
        @Query('fleet_type') fleet_type: string = null,
    ) {
        if (date == null) {
            throw new InternalServerErrorException('Invalid parameter');
        }

        return this.discountService.findOne(date, location_id, fleet_type);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @RoleTypes(RoleType.ADMIN)
    @ApiBearerAuth()
    create(@Body() dto: CreateDiscountDto) {
        return this.discountService.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @RoleTypes(RoleType.ADMIN)
    @ApiBearerAuth()
    update(@Param('id') id: number, @Body() dto: UpdateDiscountDto) {
        return this.discountService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @RoleTypes(RoleType.ADMIN)
    @ApiBearerAuth()
    remove(@Param('id') id: string) {
        return this.discountService.remove(+id);
    }
}
