import { ApiProperty } from "@nestjs/swagger";

export class GetDiscountPaginationDto {

    @ApiProperty({ default: 1 })
    page: number = 1;

    @ApiProperty({ default: 10 })
    limit: number = 10;

}