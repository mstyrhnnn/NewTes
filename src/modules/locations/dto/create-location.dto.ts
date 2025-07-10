import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateLocationDto {

    @ApiProperty({ required: true })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    location: string;

    @ApiProperty({ required: true })
    address: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    map_url: string;

    @ApiProperty({ required: true })
    @IsNotEmpty()
    redirect_url: string;
}
