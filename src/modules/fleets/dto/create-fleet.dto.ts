import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, ValidateIf, ValidateNested } from "class-validator";
import { FleetTypeEnum } from "../enums/fleet.type.enum";
import { FleetComission } from "../model/fleet-comission.model";
import { Type } from "class-transformer";

export class CreateFleetDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        default: FleetTypeEnum.CAR,
    })
    @IsEnum(FleetTypeEnum)
    type: FleetTypeEnum;

    @ApiProperty({ required: false, nullable: true })
    color?: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    plate_number: string;

    @ApiProperty({ nullable: true })
    photos?: string[];

    @ApiProperty({ type: 'number' })
    @IsNotEmpty()
    price: number;

    @ApiProperty({ type: 'number', required: true })
    @IsNotEmpty()
    location_id: number;

    @ApiProperty({
        type: FleetComission,
        required: true,
    })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => FleetComission)
    @ValidateIf(o => o.commission)
    commission: FleetComission;

    @ApiProperty({ type: 'number', required: true })
    @IsNotEmpty()
    @ValidateIf(o => o.owner_id)
    owner_id: number;
}
