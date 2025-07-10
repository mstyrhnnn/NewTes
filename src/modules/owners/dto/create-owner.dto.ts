import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, MinLength } from "class-validator";
import { BaseOwnerDto } from "./base-owner.dto";

export class CreateOwnerDto extends PartialType(BaseOwnerDto) {

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(5)
    password: string;
}
