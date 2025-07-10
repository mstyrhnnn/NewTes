import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";
import { LedgerStatus } from "../enums/ledger-status.enum";

export class CreateLedgerDto {

    @IsNumber()
    @ApiProperty()
    fleet_id: number;

    @IsNumber()
    @ApiProperty({
        required: false,
        nullable: true
    })
    @ValidateIf(o => o.category == null)
    category_id: number;

    @IsString()
    @ValidateIf(o => o.category_id == null)
    @ApiProperty({
        required: false,
        nullable: true
    })
    category: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        required: false,
        nullable: true
    })
    description: string;

    @IsDateString()
    @ApiProperty({
        example: '2024-08-01T00:00:00.000Z',
        description: 'Date of the ledger using GMT+0 timezone'
    })
    date: Date;

    @IsNumber()
    @ApiProperty()
    @ValidateIf(o => o.debit_amount == null)
    credit_amount: number;

    @IsNumber()
    @ApiProperty()
    @ValidateIf(o => o.credit_amount == null)
    debit_amount: number;

    @IsEnum(LedgerStatus)
    @ApiProperty({
        enum: LedgerStatus
    })
    status: LedgerStatus;
}
