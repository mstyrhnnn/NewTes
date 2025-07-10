import { ApiProperty } from "@nestjs/swagger";

export class GetOwnerPaginationDto {

    @ApiProperty({ default: 1 })
    page?: number = 1;

    @ApiProperty({ default: 10 })
    limit?: number = 10;

    @ApiProperty({ nullable: true, required: false })
    q?: string;
}