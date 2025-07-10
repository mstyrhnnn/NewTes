import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean } from "class-validator";

export class DeleteOrderDto {

    constructor(data = {}) {
        Object.assign(this, data);
    }

    @ApiProperty({ default: false })
    @IsBoolean()
    @Transform(value => JSON.parse(value.value))
    force: boolean = false;
}