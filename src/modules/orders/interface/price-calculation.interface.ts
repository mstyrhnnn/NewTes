import { FleetsEntity } from "src/modules/fleets/entities/fleet.entity";
import { InsuranceEntity } from "../../insurances/entities/insurances.entity";
import { OrderAdditionalItems } from "./order-additionals.interface";

export interface PriceCalculationInterface {
    rent_price: number;
    total_rent_price: number;
    service_price: number;
    insurance_price: number;
    driver_price: number;
    out_of_town_price: number;
    total_driver_price: number;
    weekend_days: string[];
    weekend_price: number;
    additional_services: OrderAdditionalItems[];
    total_weekend_price: number;
    sub_total: number;
    discount_percentage: number;
    discount: number;
    total: number;
    tax: number;
    grand_total: number;
    insurance: InsuranceEntity;
    fleet: FleetsEntity;
}