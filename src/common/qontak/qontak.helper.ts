require('dotenv').config();

import axios, { AxiosRequestConfig } from 'axios';
import { ConflictException } from '@nestjs/common';

import { BroadcastDirectParam } from './param/broadcast-direct.param';

import { BroadcastDirectResponse } from './response/broadcast-direct.response';

export class QontakHelper {
    private static authHeader = {
        'Authorization': `Bearer ${process.env.QONTAK_TOKEN}`,
    }

    private static config: AxiosRequestConfig = {
        headers: this.authHeader,
    }

    private static URL = process.env.QONTAK_URL;

    static async broadcastDirect(data: BroadcastDirectParam): Promise<BroadcastDirectResponse> {
        try {
            const response = await axios.post(
                `${this.URL}broadcasts/whatsapp/direct`,
                data,
                this.config,
            );

            console.log(response.data.data)

            return response.data.data;
        } catch (error) {
            console.log(error.response.data)

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