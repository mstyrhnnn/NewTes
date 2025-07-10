import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";

export class GetLedgerCategoriesDto {

    constructor(data) {
        Object.assign(this, data);
    }

    @ApiProperty({ default: 1 })
    @IsNumber()
    @Transform(value => +value.value)
    page: number = 1;

    @ApiProperty({ default: 10 })
    @IsNumber()
    @Transform(value => +value.value)
    limit: number = 10;

    @ApiProperty({ nullable: true, required: false })
    q?: string;
}