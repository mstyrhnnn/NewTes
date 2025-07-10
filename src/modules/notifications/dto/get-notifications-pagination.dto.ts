import { ApiProperty } from "@nestjs/swagger";

export class GetNotificationPaginationDto {

    @ApiProperty({ default: 1 })
    page: number = 1;

    @ApiProperty({ default: 10 })
    limit: number = 10;

    constructor(data) {
        Object.assign(this, data);
    }
}