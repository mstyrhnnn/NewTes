export class CreatePartnerResponse {

    constructor(data) {
        Object.assign(this, data);
    }

    id: string;

    name: string;

    number: string;

    type: string;

    email: string;

    phone: string;
}