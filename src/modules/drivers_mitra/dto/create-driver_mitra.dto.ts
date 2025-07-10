import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDriverMitraDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  phone_number: string;

  @IsOptional()
  @IsString()
  photo_profile?: string;
}
