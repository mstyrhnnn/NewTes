import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class GetLedgerFleetDto {

    constructor(data) {
        Object.assign(this, data);
    }

    @ApiProperty({ default: 1 })
    @Transform(value => +value.value)
    page: number = 1;

    @ApiProperty({ default: 10 })
    @Transform(value => +value.value)
    limit: number = 10;
}