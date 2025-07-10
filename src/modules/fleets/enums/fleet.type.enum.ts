export enum FleetTypeEnum {
    CAR = 'car',
    MOTORCYCLE = 'motorcycle',
}

export const getFleetTypeLabel = (type: FleetTypeEnum) => {
    switch (type) {
        case FleetTypeEnum.CAR:
            return 'Mobil';
        case FleetTypeEnum.MOTORCYCLE:
            return 'Motor';
        default:
            return '';
    }
}