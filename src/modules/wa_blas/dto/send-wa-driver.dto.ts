import { IsInt, IsOptional, IsString, IsNumberString } from 'class-validator';

export class SendWaRawDto {
  @IsInt()
  driver_id: number;

  @IsOptional()
  @IsString()
  saldo?: string;

  @IsOptional()
  @IsString()
  biaya_sewa?: string;

  @IsOptional()
  @IsString()
  jumlah_kekurangan?: string;

  @IsOptional()
  @IsString()
  jumlah_kelebihan?: string;
}
