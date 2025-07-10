require('dotenv').config();

import axios, { AxiosRequestConfig } from 'axios';
import { PurchaseInvoiceCreateParam } from './param/purchase-invoice.create.param';
import { PurchaseInvoiceResponse } from './response/purchase-invoice.response';
import { SalesInvoiceCreateResponse } from './response/sales-invoices.create.response';
import { ConflictException } from '@nestjs/common';
import { SalesInvoiceUpdateResponse } from './response/sales-invoices.update.response';
import { PurchaseInvoiceUpdateParam } from './param/purchase-invoice.update.param';
import { CreatePartnerParam } from './param/create-partner.param';
import { CreatePartnerResponse } from './response/create-partner.response';

export class PaperHelper {
    private static authHeader = {
        'client_id': process.env.PAPER_CLIENT_ID,
        'client_secret': process.env.PAPER_CLIENT_SECRET,
    }

    private static config: AxiosRequestConfig = {
        headers: this.authHeader,
    }

    private static URL = process.env.PAPER_URL;

    static async createSalesInvoice(data: PurchaseInvoiceCreateParam): Promise<PurchaseInvoiceResponse> {
        try {
            // create axios fetch based on the curl above
            console.log(data);

            const response = await axios.post(
                `${this.URL}/v1/store-invoice`,
                data,
                this.config,
            );

            return response.data.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    static async updateSalesInvoice(id: string, data: PurchaseInvoiceUpdateParam): Promise<SalesInvoiceUpdateResponse> {
        try {
            const response = await axios.post(
                `${this.URL}/v1/sales-invoice/${id}/update`,
                data,
                this.config,
            );

            return response.data.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    static async deleteSalesInvoice(id: string): Promise<void> {
        try {
            const response = await axios.delete(
                `${this.URL}/v1/sales-invoice/${id}`,
                this.config,
            );

            return response.data.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    static async getSalesInvoice(id: string): Promise<SalesInvoiceCreateResponse> {
        try {
            const response = await axios.get(
                `${this.URL}/v1/sales-invoices/${id}`,
                this.config,
            );
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    static async createPartner(data: CreatePartnerParam): Promise<CreatePartnerResponse> {
        try {
            const response = await axios.post(
                `${this.URL}/v2/partners`,
                data,
                this.config,
            );

            return response.data.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    static async updatePartner(id: string, data: CreatePartnerParam): Promise<CreatePartnerResponse> {
        try {
            const response = await axios.put(
                `${this.URL}/v2/partners/${id}`,
                data,
                this.config,
            );

            return response.data.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    private static handleError(error) {
        console.error(error);

        if (error.response) {
            throw new ConflictException(error.response.data);
        }

        throw new ConflictException(error);
    }

}