import { ApiProperty } from "@nestjs/swagger";
import { ValidateIf } from "class-validator";

export class GetLocationPaginationDto {

    @ApiProperty({ default: 1 })
    page: number = 1;

    @ApiProperty({ default: 10 })
    @ValidateIf((o) => o.limit)
    limit: number = 10;

    @ApiProperty({ nullable: true, required: false })
    q?: string;

    constructor(data) {
        Object.assign(this, data);
    }
}