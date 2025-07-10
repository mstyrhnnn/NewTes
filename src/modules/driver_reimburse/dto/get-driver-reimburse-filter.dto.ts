import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ReimburseStatus } from '../enums/reimburse-status.enum';
import { Type } from 'class-transformer';

export class GetDriverReimburseFilterDto {
  @IsEnum(ReimburseStatus)
  @IsOptional()
  status?: ReimburseStatus;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}
