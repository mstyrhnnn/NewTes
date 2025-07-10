import { Controller, Get, Param, Post, Body, ParseIntPipe, Patch, UseGuards, BadRequestException  } from '@nestjs/common';
import { BusserService } from './busser.service';
import { BusserEntity, BusserStatusEnum } from './busser.entity';
// import { AuthGuard } from '@nestjs/passport'; // Contoh jika Anda pakai authentikasi

@Controller('busser')
// @UseGuards(AuthGuard('jwt')) // Sebaiknya semua endpoint ini diproteksi
export class BusserController {
  constructor(private readonly busserService: BusserService) {}

  @Get('trigger-check')
  async triggerCheck() {
    this.busserService.checkAndUpdateStatuses();
    return { message: 'Pengecekan status busser telah dipicu. Lihat log di konsol.' };
  }

  @Get('status/:status')
  async getBussersByStatus(@Param('status') status: BusserStatusEnum): Promise<BusserEntity[]> {
    return this.busserService.getBussersByStatus(status);
  }
  
  @Patch(':id/assign')
  async assignTask(
    @Param('id', ParseIntPipe) id: number,
    @Body('investigatorId', ParseIntPipe) investigatorId: number,
  ): Promise<BusserEntity> {
    // Di dunia nyata, investigatorId mungkin diambil dari user yang sedang login (request.user.id)
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