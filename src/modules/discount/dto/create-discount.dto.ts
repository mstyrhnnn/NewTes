import { IsDate, IsNumber, Validate } from "class-validator";
import { IsAfterStartDateConstraint } from "../validator/start-date.validator";
import { Column } from "typeorm";

export class CreateDiscountDto {

    @IsNumber()
    discount: number;

    start_date: Date;

    location_id: number;

    fleet_type: string;

    @Validate(IsAfterStartDateConstraint)
    end_date: Date;

}