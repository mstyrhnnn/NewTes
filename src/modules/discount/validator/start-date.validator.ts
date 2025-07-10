import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isAfterStartDate', async: false })
export class IsAfterStartDateConstraint implements ValidatorConstraintInterface {
    validate(endDate: Date, args: ValidationArguments): boolean {
        const { object } = args;
        return object['startDate'] ? endDate > object['startDate'] : true;
    }

    defaultMessage(args: ValidationArguments): string {
        return 'endDate must be after startDate';
    }
}