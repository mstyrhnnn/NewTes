import { ApiProperty, PartialType } from "@nestjs/swagger";
import { GetFleetPaginationDto } from "./get-fleet-pagination.dto";
import { IsDateString, IsEnum, IsNumberString, ValidateIf } from "class-validator";
import { FleetTypeEnum } from "../enums/fleet.type.enum";

export class GetFleetAvailabilityPaginationDto extends PartialType(GetFleetPaginationDto) {

    @ApiProperty({
        format: 'date-time',
    })
    @IsDateString()
    @ValidateIf(dto => dto.date)
    date: string;

    @ApiProperty({
        default: 1,
        maximum: 30,
    })
    @IsNumberString()
    @ValidateIf(dto => dto.duration)
    duration: number;

    @IsEnum(FleetTypeEnum)
    @ApiProperty({
        enum: FleetTypeEnum,
        required: false,
        nullable: true,
    })
    @ValidateIf(dto => dto.type)
    type: FleetTypeEnum;

    @ApiProperty({
        required: false,
        nullable: true,
    })
    @IsNumberString()
    @ValidateIf(dto => dto.location_id)
    location_id: number;
}