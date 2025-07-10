import { ApiProperty, PartialType } from "@nestjs/swagger";
import { ArrayNotEmpty, IsNotEmpty, MinLength, ValidateIf } from "class-validator";
import { BaseCustomerDto } from "./base-customer.dto";

export class CreateCustomerDto extends PartialType(BaseCustomerDto) {

    @ApiProperty({
        required: false,
        nullable: true,
    })
    @MinLength(5)
    @ValidateIf(o => o.password)
    password: string;

    @ApiProperty({ nullable: false })
    @ArrayNotEmpty()
    @IsNotEmpty()
    id_cards: string[];

    @ApiProperty({ required: true })
    @IsNotEmpty()
    emergency_phone_number?: string;
}
