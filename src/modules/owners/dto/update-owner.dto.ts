import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseOwnerDto } from './base-owner.dto';
import { MinLength, ValidateIf } from 'class-validator';

export class UpdateOwnerDto extends PartialType(BaseOwnerDto) {

    @ApiProperty({
        required: false,
        nullable: true,
    })
    @MinLength(5)
    @ValidateIf(o => o.password)
    password: string;
}
