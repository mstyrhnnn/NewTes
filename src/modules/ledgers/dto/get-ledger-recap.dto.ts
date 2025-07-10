import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";
import { IsDateOnly } from "src/config/validator/is_date_only";

export class GetLedgerRecapDto {

    constructor(data) {
        Object.assign(this, data);
    }

    @ApiProperty()
    @IsString()
    @IsOptional()
    q?: string;

    @ApiProperty()
    @Transform(value => +value.value)
    month: number;

    @ApiProperty()
    @Transform(value => +value.value)
    year: number;

    @ApiProperty({
        nullable: true,
        required: false,
        type: 'date',
    })
    @IsDateOnly()
    @ValidateIf((o) => o.start_date)
    start_date?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    status?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        type: 'date',
    })
    @IsDateOnly()
    @ValidateIf((o) => o.end_date)
    end_date?: string;
}