export class CreatePartnerParam {

    constructor(data) {
        Object.assign(this, data);
    }

    email: string;

    phone: string;

    name: string;

    number: string;

    type: string = 'client';
}