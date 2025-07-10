import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ReimburseStatus } from '../enums/reimburse-status.enum';

export class UpdateDriverReimburseStatusDto {
  @IsEnum(ReimburseStatus)
  status: ReimburseStatus;

  @ValidateIf((dto) => dto.status === ReimburseStatus.REJECTED)
  @IsString()
  @IsOptional()
  rejection_reason?: string;
}
