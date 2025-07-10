import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateCustomerDto } from "src/modules/customers/dto/create-customer.dto";

export class AuthRegisterDto extends PartialType(CreateCustomerDto) {

    @ApiProperty({
        nullable: true,
        description: 'fcm token for push notification',
        required: false,
    })
    token?: string;
}