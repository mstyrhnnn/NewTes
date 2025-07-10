import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class FleetComission {

    constructor(data) {
        Object.assign(this, data);
    }

    @ApiProperty({
        type: Number,
        example: 20,
    })
    @IsNumber()
    transgo: number = null;

    @ApiProperty({
        type: Number,
        example: 70,
    })
    @IsNumber()
    owner: number = null;

    @ApiProperty({
        type: Number,
        example: 10,
    })
    @IsNumber()
    partner: number = null;
}