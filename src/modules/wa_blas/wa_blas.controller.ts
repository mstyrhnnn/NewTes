import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { WaBlasService } from './wa_blas.service';
import { SendWaDto } from './dto/send-wa.dto';
import { SendWaRawDto } from './dto/send-wa-driver.dto';
import { RoleType } from 'src/config/auth/role/role.enum';
import { JwtAuthGuard } from 'src/config/guard/jwt-auth.guard';
import { RoleGuard } from 'src/config/auth/role/role.guard';
import { RoleTypes } from 'src/config/auth/role/role.decorator';

@Controller({
  version: '1',
  path: 'wa-blas',
})
@ApiTags('v1/wa-blas')

@UseGuards(JwtAuthGuard, RoleGuard)
@RoleTypes(RoleType.ADMIN)
@ApiBearerAuth()
export class WaBlasController {
  constructor(private readonly waBlasService: WaBlasService) {}

  @Get('fleets')
  getFleetsWithDrivers() {
    return this.waBlasService.getFleetWithDrivers();
  }

  @Post('send')
  sendWaBlas(@Body() dto: SendWaDto) {
    return this.waBlasService.sendWaBlasByDto(dto);
  }

  @Post('send-wa-driver')
  bulkSendDriver(@Body() body: SendWaRawDto[]) {
    return this.waBlasService.bulkSendWaDriver(body);
  }
}
