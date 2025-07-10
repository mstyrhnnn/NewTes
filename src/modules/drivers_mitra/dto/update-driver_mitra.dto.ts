import { PartialType } from '@nestjs/mapped-types';
import { CreateDriverMitraDto } from './create-driver_mitra.dto';

export class UpdateDriverMitraDto extends PartialType(CreateDriverMitraDto) {}
