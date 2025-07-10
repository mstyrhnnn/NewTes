export class PurchaseInvoiceResponse {
    id: string;
    number: string;
    payper_url: string;
    pdf_url: string;
    pdf_url_short: string;
    status_send: {
        email: boolean;
        whatsapp: boolean;
        sms: boolean;
    };
}