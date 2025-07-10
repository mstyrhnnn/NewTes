import { PurchaseInvoiceItemParam } from "src/common/payment/paper/param/purchase-invoice-item.param";
import { UserEntity } from "src/modules/users/entities/user.entity";

export class PurchaseInvoiceCreateParam {
    invoiceNumber: string;
    customer: UserEntity;
    date: string;
    discount?: number;
    items: PurchaseInvoiceItemParam[];
    total: number;
    duration: number;
}

export class PurchaseInvoiceUpdateParam extends PurchaseInvoiceCreateParam { }