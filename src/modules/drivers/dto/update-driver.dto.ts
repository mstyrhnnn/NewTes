import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BaseDriverDto } from './base-driver.dto';
import { MinLength, ValidateIf } from 'class-validator';

export class UpdateDriverDto extends PartialType(BaseDriverDto) {

    @ApiProperty({
        required: false,
        nullable: true,
    })
    @MinLength(5)
    @ValidateIf(o => o.password)
    password: string;
}
