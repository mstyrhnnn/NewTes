import { OrderPaymentStatusEnum } from "src/modules/orders/enums/order.payment-status.enum";

export enum LedgerStatus {
    // Order payment status
    PENDING = 'pending',
    DONE = 'done',
    PARTIALLY_PAID = 'partially paid',

    // Ledger status
    ON_HOLD = 'on_hold',
    PROCCESSED = 'proccessed',
}

export const getLedgerStatusFromPaymentStatus = (paymentStatus: OrderPaymentStatusEnum): LedgerStatus => {
    switch (paymentStatus) {
        case OrderPaymentStatusEnum.PENDING:
            return LedgerStatus.PENDING;
        case OrderPaymentStatusEnum.DONE:
            return LedgerStatus.DONE;
        case OrderPaymentStatusEnum.PARTIALLY_PAID:
            return LedgerStatus.PARTIALLY_PAID;
        default:
            return LedgerStatus.PENDING;
    }
}