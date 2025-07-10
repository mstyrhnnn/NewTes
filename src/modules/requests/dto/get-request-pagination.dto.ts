import { ApiProperty } from "@nestjs/swagger";
import { RequestStatusEnum } from "../enums/request.status.enum";
import { IsDateString, IsEnum, IsNumber, ValidateIf } from "class-validator";

export class GetRequestPaginationDto {

    @ApiProperty({ default: 1 })
    page: number = 1;

    @ApiProperty({ default: 10 })
    limit: number = 10;

    @ApiProperty({
        enum: RequestStatusEnum,
        nullable: true,
    })
    @IsEnum(RequestStatusEnum)
    status?: string;

    @ApiProperty({ nullable: true, required: false })
    q?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        type: 'date',
    })
    @IsDateString()
    @ValidateIf((o) => o.start_date)
    start_date?: string;

    @ApiProperty({
        nullable: true,
        required: false,
        type: 'date',
    })
    @IsDateString()
    @ValidateIf((o) => o.end_date)
    end_date?: string;
}