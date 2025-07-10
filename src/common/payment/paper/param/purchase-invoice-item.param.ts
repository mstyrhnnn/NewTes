
export interface PurchaseInvoiceItemParam {
    name: string;
    description: string;
    quantity: number;
    price: number;
    discount?: number;
    tax_id?: string;
}
