import { IsString, IsOptional } from 'class-validator';

export class SendWaDto {
  driverId: number; 

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
