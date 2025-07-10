import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty } from "class-validator";
import { IsDateOnly } from "src/config/validator/is_date_only";

export class ExtendRentalDto {

    @ApiProperty({
        format: 'date',
        example: '2025-07-30',
        description: 'The proposed new end date for the rental in YYYY-MM-DD format.',
    })
    @IsNotEmpty()
    @IsDateString()
    @IsDateOnly()
    newEndDate: string;
}