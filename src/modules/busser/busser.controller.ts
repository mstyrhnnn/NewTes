import { Controller, Get, Param, Post, Body, ParseIntPipe, Patch, UseGuards, BadRequestException  } from '@nestjs/common';
import { BusserService } from './busser.service';
import { BusserEntity, BusserStatusEnum } from './busser.entity';
import { BusserDetailsDto } from './dto/busser-details.dto';

@Controller('busser')
export class BusserController {
  constructor(private readonly busserService: BusserService) {}

  @Get('trigger-check')
  async triggerCheck() {
    this.busserService.checkAndUpdateStatuses();
    return { message: 'Pengecekan status busser telah dipicu. Lihat log di konsol.' };
  }

  @Get('status/:status')
  async getCustomersByStatus(
    @Param('status') status: BusserStatusEnum,
  ): Promise<BusserDetailsDto[]> {
    return this.busserService.getBussersByStatus(status);
  }
  @Patch(':id/assign')
  async assignTask(
    @Param('id', ParseIntPipe) id: number,
    @Body('investigatorId', ParseIntPipe) investigatorId: number,
  ): Promise<BusserDetailsDto> {
    return this.busserService.assignTask(id, investigatorId);
  }
  
  @Patch(':id/resolve')
  async resolveBusser(
    @Param('id', ParseIntPipe) id: number,
    @Body('notes') notes: string,
  ): Promise<BusserEntity> {
    return this.busserService.resolveBusser(id, notes);
  }
}