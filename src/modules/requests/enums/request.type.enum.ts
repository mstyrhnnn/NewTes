export enum RequestTypeEnum {
    DELIVERY = 'delivery',
    PICK_UP = 'pick_up',
}

export function getRequestTypeText(type: string, isSelfPickup: boolean): string {
    if (type == RequestTypeEnum.DELIVERY) {
        return isSelfPickup ? 'Pengambilan' : 'Pengantaran';
    } else if (type == RequestTypeEnum.PICK_UP) {
        return isSelfPickup ? 'Pengembalian' : 'Penjemputan';
    } else {
        return '-';
    }
}

export function replaceRequestTypeText(text: string, requestType: string, isSelfPickup: boolean): string {
    return text.replace('{request_type}', `${getRequestTypeText(requestType, isSelfPickup)}`);
}