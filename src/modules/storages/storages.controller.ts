import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StoragesService } from './storages.service';
import { UploadDto } from './dto/upload.dto';
import { UploadListDto } from './dto/upload-list.dto';
import { BasicOrJwtAuthGuard } from 'src/config/guard/basic-jwt-auth.guard';

@Controller({
    version: '1',
    path: 'storages',
})
@ApiTags('v1/storages')
export class StoragesController {

    constructor(
        private storagesService: StoragesService,
    ) { }

    @UseGuards(BasicOrJwtAuthGuard)
    @ApiBearerAuth()
    @ApiBasicAuth()
    @Get('presign')
    async getPresign(@Query() dto: UploadDto) {
        return this.storagesService.getPresign(dto);
    }

    @UseGuards(BasicOrJwtAuthGuard)
    @ApiBearerAuth()
    @ApiBasicAuth()
    @Post('presign/list')
    async getPresignList(@Body() dto: UploadListDto) {
        return this.storagesService.getPresignList(dto);
    }
}
