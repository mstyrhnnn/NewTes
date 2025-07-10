import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  IsDate,
  IsNotEmpty,
  Length,
  IsOptional,
  IsUrl,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDriverReimburseDto {
  @ApiProperty({ example: 1, description: 'ID driver' })
  @IsNumber()
  driver_id: number;

  @ApiProperty({ example: 500000, description: 'Nominal reimburse' })
  @IsNumber()
  @Min(1000, { message: 'Minimal nominal reimburse Rp. 1.000' })
  @Max(100000000, { message: 'Maksimal nominal reimburse Rp. 100.000.000' })
  nominal: number;

  @ApiProperty({ example: '1234567890', description: 'Nomor rekening' })
  @IsString()
  @Matches(/^[0-9]{10,16}$/, {
    message:
      'Nomor rekening harus berupa angka dengan panjang digit 10-16 digit',
  })
  noRekening: string;

  @ApiProperty({ example: 'BCA', description: 'Bank' })
  @IsString()
  bank: string;

  @ApiProperty({ example: 1, description: 'ID lokasi' })
  @IsNumber()
  location_id: number;

  @ApiProperty({ example: '2022-01-01', description: 'Tanggal reimburse' })
  @IsDate()
  @Type(() => Date)
  @Transform(({ value }) => {
    if (value > new Date()) {
      throw new Error('Harus tanggal hari ini');
    }
    return value;
  })
  date: Date;

  @ApiProperty({
    example: 'Pembayaran gaji',
    description: 'Keterangan reimburse',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'https://qxaxamgy1q.ufs.sh/f/abc123-filename.jpg',
    description: 'URL bukti transaksi dari UploadThing',
  })
  @IsOptional()
  @IsUrl(
    { protocols: ['https'], host_whitelist: ['qxaxamgy1q.ufs.sh'] }, // Hanya terima URL dari UploadThing
    { message: 'URL harus berasal dari UploadThing (qxaxamgy1q.ufs.sh)' },
  )
  transaction_proof_url?: string; // Opsional untuk driver

  @ApiProperty({ example: 1, description: 'ID kendaraan yang digunakan' })
  @IsNumber()
  @IsOptional()
  fleet_id?: number;
}
