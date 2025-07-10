import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNotEmpty, MinLength } from "class-validator";
import { BaseDriverDto } from "./base-driver.dto";

export class CreateDriverDto extends PartialType(BaseDriverDto) {

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(5)
    password: string;
}
