import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, Max } from "class-validator";
import { FleetTypeEnum } from "../enums/fleet.type.enum";

export class GetFleetCalendarPaginationDto {

    constructor(data) {
        Object.assign(this, data);
    }

    @ApiProperty({ default: 1 })
    @IsNumber()
    @Transform(value => +value.value)
    page: number = 1;

    @ApiProperty({ default: 5 })
    @IsNumber()
    @Transform(value => +value.value)
    @Transform(value => parseInt(value.value))
    @Max(5)
    limit: number = 5;

    @ApiProperty({ nullable: true, required: false })
    q?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        enum: FleetTypeEnum,
    })
    @IsEnum(FleetTypeEnum)
    @IsOptional()
    type?: FleetTypeEnum;

    @ApiProperty({ default: 2024 })
    @IsNumber()
    @Transform(value => +value.value)
    year: string;

    @ApiProperty({ default: 6 })
    @IsNumber()
    @Transform(value => +value.value)
    month: string;

    @ApiProperty({ default: false })
    @IsBoolean()
    @Transform(value => JSON.parse(value.value))
    order_only: boolean = false;
}