import { IsDate, IsNumber, Validate } from "class-validator";
import { IsAfterStartDateConstraint } from "../validator/start-date.validator";

export class UpdateDiscountDto {

    @IsNumber()
    id: number;

    @IsNumber()
    discount: number;

    start_date: Date;

    location_id: number;

    fleet_type: string;   

    @Validate(IsAfterStartDateConstraint)
    end_date: Date;
}