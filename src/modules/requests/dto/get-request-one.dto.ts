import { ApiProperty } from "@nestjs/swagger";

export class GetRequestOneDto {

    @ApiProperty({ default: false, required: false, type: Boolean })
    with_related_requests: string = 'false';

    constructor(data) {
        Object.assign(this, data);
    }
}