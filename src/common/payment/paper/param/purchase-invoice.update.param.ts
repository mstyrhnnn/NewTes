import { PurchaseInvoiceItemParam } from "./purchase-invoice-item.param";

export class PurchaseInvoiceUpdateParam {
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
    totals: number;
    send: {
        email: boolean;
        whatsapp: boolean;
        sms: boolean;
    };
    total_discount: number;

    constructor(data) {
        Object.assign(this, data);
    }
}
