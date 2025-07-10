import { Injectable } from "@nestjs/common";
import { QontakHelper } from "src/common/qontak/qontak.helper";
import { BroadcastDirectParam } from "src/common/qontak/param/broadcast-direct.param";
import { MessageParam } from "./params/message.param";

@Injectable()
export class QontakService {
  constructor() { }

  async sendMessage(dto: {
    to: string;
    customerName: string,
    message: MessageParam,
  }) {
    await QontakHelper.broadcastDirect(new BroadcastDirectParam({
      to_number: dto.to,
      to_name: dto.customerName,
      message_template_id: dto.message.template_id,
      parameters: {
        body: dto.message.body,
      }
    }))
  }
}