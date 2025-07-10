import { PurchaseInvoiceItemParam } from "./purchase-invoice-item.param";

export class PurchaseInvoiceCreateParam {
    invoice_date: string;
    due_date: string;
    number: string;
    customer: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    items: PurchaseInvoiceItemParam[];
    signature_text_header: string;
    signature_text_footer: string;
    terms_condition: string;
    send: {
        email: boolean;
        whatsapp: boolean;
        sms: boolean;
    };
    total_discount?: number;
    total: number;

    constructor(data) {
        Object.assign(this, data);
    }
}

