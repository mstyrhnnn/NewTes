export class SalesInvoiceCreateResponse {
    data: {
        number: string;
        invoice_date: string;
        due_date: string;
        status: {
            payment_status: string;
            acceptance_status: string;
        };
        payment_link: string;
        pdf_link: string;
        items: {
            name: string;
            code: string;
            description: string;
            quantity: number;
            uom: string;
            price: number;
            discount: number;
            tax: number;
        }[];
        total: number;
        terms_condition: string;
        notes: string;
        created_at: string;
        modified_at: string;
    }
}