require('dotenv').config();

export class BroadcastDirectParam {

    constructor(data) {
        Object.assign(this, data);
    }

    to_number: string;

    to_name: string;

    message_template_id: string;

    channel_integration_id: string = process.env.QONTAK_INTEGRATION_ID;

    language: {
        code: string;
    } = { code: 'id' };

    parameters: {
        body: string[];
    }

}