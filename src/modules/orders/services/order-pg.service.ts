import { Injectable } from '@nestjs/common';
import { PaperHelper } from 'src/common/payment/paper/paper.helper';
import { DateHelper } from 'src/config/helper/date/date.helper';
import { PurchaseInvoiceCreateParam, PurchaseInvoiceUpdateParam } from '../params/purchase-invoice.param';

@Injectable()
export class OrderPgService {

    constructor() { }

    async createSalesInvoice(
        param: PurchaseInvoiceCreateParam,
    ) {
        const date = DateHelper.getJakartaMoment(new Date().toISOString());
        const startDate = DateHelper.getJakartaMoment(param.date);
        const dueDate = DateHelper.addDaysMoment(startDate, param.duration + 1);

        return PaperHelper.createSalesInvoice({
            number: param.invoiceNumber,
            invoice_date: date.format('DD-MM-yyyy'),
            due_date: dueDate.format('DD-MM-yyyy'),
            customer: {
                id: param.customer.paper_number.toString(),
                name: param.customer.name,
                email: param.customer.email,
                phone: param.customer.phone_number,
            },
            items: param.items,
            signature_text_header: date.format('DD MMM, yyyy'),
            signature_text_footer: 'Muhammad Qolbu Almarifah',
            terms_condition: 'Dengan dibayarnya Invoice ini, penyewa setuju dengan syarat dan ketentuan rental seperti yang disebutkan di video berikut, <a href="https://www.youtube.com/watch?v=w8zUPL4hJB4">https://www.youtube.com/watch?v=w8zUPL4hJB4</a>',
            send: {
                email: true,
                whatsapp: true,
                sms: true,
            },
            total_discount: param.discount,
            total: param.total,
        });
    };

    async updateSalesInvoice(
        id: string,
        param: PurchaseInvoiceUpdateParam,
    ) {
        const date = DateHelper.getJakartaMoment(new Date().toISOString());
        const startDate = DateHelper.getJakartaMoment(param.date);
        const dueDate = DateHelper.addDaysMoment(startDate, 1);

        return PaperHelper.updateSalesInvoice(id, {
            number: param.invoiceNumber,
            invoice_date: date.format('DD-MM-yyyy'),
            due_date: dueDate.format('DD-MM-yyyy'),
            customer: {
                id: param.customer.paper_number.toString(),
                email: param.customer.email,
                name: param.customer.name,
                phone: param.customer.phone_number,
            },
            items: param.items,
            send: {
                email: true,
                whatsapp: true,
                sms: true,
            },

            total_discount: param.discount,
            totals: param.total,
        });
    };

    async deleteSalesInvoice(id: string) {
        return PaperHelper.deleteSalesInvoice(id);
    }

    async getSalesInvoice(id: string) {
        return PaperHelper.getSalesInvoice(id);
    }
}