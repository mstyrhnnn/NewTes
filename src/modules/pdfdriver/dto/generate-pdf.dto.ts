import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum SignatureType {
    PENGANTARAN = 'Pengantaran',
    PENGAMBILAN = 'Pengambilan',
    PENJEMPUTAN = 'Penjemputan',
    PENGEMBALIAN = 'Pengembalian',
  }
  
  export class GeneratePdfDto {
    @IsString()
    @IsNotEmpty()
    signer: string;
  
    @IsEnum(SignatureType)
    type: SignatureType;
  }
  