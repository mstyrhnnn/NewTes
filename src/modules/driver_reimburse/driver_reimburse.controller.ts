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
  ParseIntPipe,
  UseInterceptors,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DriverReimburseService } from './driver_reimburse.service';
import { CreateDriverReimburseDto } from './dto/create-driver-reimburse.dto';
import { UpdateDriverReimburseStatusDto } from './dto/update-driver-reimburse.dto';
import { JwtAuthGuard } from 'src/config/guard/jwt-auth.guard';
import { RoleGuard } from 'src/config/auth/role/role.guard';
import { RoleTypes } from 'src/config/auth/role/role.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleType } from 'src/config/auth/role/role.enum';
import { GetDriverReimburseFilterDto } from './dto/get-driver-reimburse-filter.dto';
import { ReimburseStatus } from './enums/reimburse-status.enum';

@Controller({
  version: '1',
  path: 'driver-reimburses',
})
@ApiTags('v1/driver-reimburses')
export class DriverReimburseController {
  constructor(
    private readonly driverReimburseService: DriverReimburseService,
  ) {}

  @ApiTags('v1/driver-reimburses/transactions')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN, RoleType.DRIVER)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({
    summary: 'Membuat pengajuan reimburse baru',
    description:
      'Hanya driver yang dapat membuat pengajuan reimburse untuk diri sendiri.',
  })
  @ApiBody({
    type: CreateDriverReimburseDto,
    examples: {
      contohRequest: {
        value: {
          nominal: 500000,
          noRekening: '1234567890',
          bank: 'BCA',
          location_id: 2,
          driver_id: 1,
          date: '2023-10-15',
          description: 'Pengajuan biaya bensin',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Pengajuan reimburse berhasil dibuat.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Data tidak valid (contoh: nominal negatif, format tanggal salah).',
  })
  @ApiResponse({
    status: 403,
    description: 'Akses ditolak (contoh: admin mencoba membuat reimburse).',
  })
  async create(
    @Body() CreateDto: CreateDriverReimburseDto,
    @Request() req: any,
  ) {
    try {
      return this.driverReimburseService.create(CreateDto, req.user.sub);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Terjadi kesalahan dalam membuat reimburse',
      );
    }
  }

  @ApiTags('v1/driver-reimburses/approval')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update status reimburse',
    description: 'Hanya admin yang bisa mengubah status reimburse.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID reimburse' })
  @ApiBody({
    type: UpdateDriverReimburseStatusDto,
    examples: {
      contoh_request_approved: {
        value: {
          status: ReimburseStatus.CONFIRMED,
          comment: 'Pengajuan disetujui',
        },
      },
    },
  })
  @ApiBody({
    type: UpdateDriverReimburseStatusDto,
    examples: {
      contoh_request_rejected: {
        value: {
          status: ReimburseStatus.REJECTED,
          rejection_reason: 'bukti tidak valid',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Status berhasil diupdate',
    schema: {
      example: {
        id: 1,
        status: 'approved',
        comment: 'Pengajuan disetujui',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'status berhasil diupdate',
    schema: {
      example: {
        id: 1,
        status: 'rejected',
        rejection_reason: 'Bukti tidak valid',
        rejected_at: '2023-10-20T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Reimburse tidak ditemukan',
  })
  @ApiResponse({
    status: 403,
    description: 'Transisi status tidak valid (contoh: dari pending ke done)',
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDriverReimburseStatusDto,
    @Request() req: any,
  ) {
    try {
      return this.driverReimburseService.updateStatus(
        +id,
        updateDto.status,
        req.user.role,
        updateDto.rejection_reason,
        req.user.sub,
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Terjadi kesalahan saat mengupdate status reimburse',
      );
    }
  }

  @ApiTags('v1/driver-reimburses')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN, RoleType.DRIVER)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua reimburse dengan filter dan pagination',
    description: 'Filter berdasarkan status, tanggal, atau driver_id.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Nomor halaman (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'jumlah item per halaman (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ReimburseStatus,
    description: 'Filter berdasarkan status (contoh: pending, approved)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: Date,
    description: 'Filter tanggal mulai (format: YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: Date,
    description: 'Filter tanggal akhir (format: YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar reimburse berhasil ditemukan.',
    schema: {
      example: {
        data: [
          {
            id: 1,
            nominal: 500000,
            status: 'pending',
            driver: { id: 1, name: 'John Doe' },
            location: { id: 2, name: 'Jakarta' },
          },
        ],
        meta: {
          total: 10,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Driver mencoba mengakses data yang bukan miliknya.',
  })
  findAll(@Query() filters: GetDriverReimburseFilterDto, @Request() req: any) {
    try {
      const driverId =
        req.user.role === RoleType.DRIVER ? req.user.sub : undefined;
      return this.driverReimburseService.findAll({
        ...filters,
        driverId,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'terjadi kesalahan saat mengambil data reimburse',
      );
    }
  }

  @ApiTags('v1/driver-reimburses/rejected')
  @Get('rejected')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN, RoleType.DRIVER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mendapatkan riwayat reimburse yang ditolak',
    description:
      'Admin bisa melihat semua riwayat penolakan, driver hanya melihat riwayat miliknya.',
  })
  @ApiResponse({
    status: 200,
    description: 'Riwayat penolakan berhasil ditemukan.',
    schema: {
      example: [
        {
          id: 1,
          nominal: 500000,
          status: 'rejected',
          rejection_reason: 'Bukti tidak valid',
          rejected_at: '2023-10-20T10:00:00.000Z',
          driver: { id: 1, name: 'John Driver' },
          admin: { id: 2, name: 'Admin Jane' },
        },
      ],
    },
  })
  async findRejected(@Request() req: any) {
    return this.driverReimburseService.findAll({
      status: ReimburseStatus.REJECTED,
      driverId: req.user.role === RoleType.DRIVER ? req.user.sub : undefined,
    });
  }

  @ApiTags('v1/driver-reimburses')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN, RoleType.DRIVER)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan detail reimburse berdasarkan ID',
    description:
      'Admin bisa melihat semua data, driver hanya bisa melihat data miliknya.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID reimburse' })
  @ApiResponse({
    status: 200,
    description: 'Detail reimburse berhasil ditemukan.',
    schema: {
      example: {
        id: 1,
        nominal: 500000,
        status: 'pending',
        driver: { id: 1, name: 'John Doe' },
        location: { id: 2, name: 'Jakarta' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Reimburse tidak ditemukan.',
  })
  @ApiResponse({
    status: 403,
    description: 'Driver mencoba mengakses data yang bukan miliknya.',
  })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.driverReimburseService.findOne(+id, req.user);
  }

  @ApiTags('v1/driver-reimburses')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus reimburse',
    description: 'Hanya admin yang bisa menghapus reimburse miliknya.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID reimburse' })
  @ApiResponse({
    status: 200,
    description: 'Reimburse berhasil dihapus.',
  })
  @ApiResponse({
    status: 404,
    description: 'Reimburse tidak ditemukan.',
  })
  @ApiResponse({
    status: 403,
    description: 'Driver mencoba menghapus data yang bukan miliknya.',
  })
  remove(
    @Param('id') id: string,
    // @Request() req: any,
  ) {
    return this.driverReimburseService.remove(+id);
  }

  @ApiTags('v1/driver-reimburses/analytics')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RoleTypes(RoleType.ADMIN)
  @ApiBearerAuth()
  @Get('status/count')
  @ApiOperation({
    summary: 'Menghitung jumlah reimburse per status',
    description: 'Hanya admin yang bisa mengakses endpoint ini.',
  })
  @ApiResponse({
    status: 200,
    description: 'Jumlah reimburse per status berhasil ditemukan.',
    schema: {
      example: [
        { status: 'pending', count: 5 },
        { status: 'confirmed', count: 3 },
        { status: 'rejected', count: 2 },
      ],
    },
  })
  getStatusCount() {
    return this.driverReimburseService.getStatusCount();
  }
}
