import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AdditionalDataDto {
  @IsString()
  @IsNotEmpty()
  uploadBatch: string;

  @IsArray()
  @IsNotEmpty({ each: true })
  id_cards: string[]; 
}
