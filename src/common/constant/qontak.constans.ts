export const QONTAK_CREATED_USER_MESSAGE = {
    template_id: "e1d4ccf5-871a-4abd-9287-a064581ae9dd",
    body: []
}

export const QONTAK_VERIFICATION_ACCOUNT = {
    template_id: "ba503493-cc33-4fd4-a877-49a1d4145c19",
    body: []
}

export const QONTAK_ACCOUNT_ACTIVE = {
    template_id: "d2170324-8622-45c9-bd63-e7680253e570",
    body: []
}

export const QONTAK_ACCEPTED_ORDER_USER = (fleetType: string, fleetName: string, duration: string, link: string) => {
    return {
        template_id: "022efc37-5ff1-4f65-b839-2d57931fdc35",
        body: [
            {
                key: "1",
                value: "fleet_type",
                value_text: fleetType,
            },
            {
                key: "2",
                value: "fleet_name",
                value_text: fleetName,
            },
            {
                key: "3",
                value: "duration",
                value_text: duration,
            },
            {
                key: "4",
                value: "link",
                value_text: link,
            }
        ]
    }
}

export const QONTAK_ACCEPTED_ORDER_OWNER = (ownerName: string, fleetType: string, fleetName: string, customerName: string, duration: string) => {
    return {
        template_id: "ee684578-f759-4d23-88c9-fb526a7545f7",
        body: [
            {
                key: "1",
                value: "owner_name",
                value_text: ownerName,
            },
            {
                key: "2",
                value: "fleet_type",
                value_text: fleetType,
            },
            {
                key: "3",
                value: "fleet_name",
                value_text: fleetName,
            },
            {
                key: "4",
                value: "customer_name",
                value_text: customerName,
            },
            {
                key: "5",
                value: "duration",
                value_text: duration,
            }
        ]
    }
}

export const QONTAK_REJECTED_ORDER = (fleetType: string, fleetName: string, duration: string, reason: string, link: string) => {
    return {
        template_id: "3d096cb9-e98e-497d-97b1-37ec813ca941",
        body: [
            {
                key: "1",
                value: "fleet_type",
                value_text: fleetType,
            },
            {
                key: "2",
                value: "fleet_name",
                value_text: fleetName,
            },
            {
                key: "3",
                value: "duration",
                value_text: duration,
            },
            {
                key: "4",
                value: "reason",
                value_text: reason,
            },
            {
                key: "5",
                value: "link",
                value_text: link,
            }
        ]
    }
}

export const QONTAK_CANCEL_ORDER = (fleetType: string, fleetName: string, duration: string, startSewa: string, endSewa: string) => {
    return {
        template_id: "c0f06c70-284f-4851-8411-f047d8d53ea1",
        body: [
            {
                key: "1",
                value: "fleet_type",
                value_text: fleetType,
            },
            {
                key: "2",
                value: "fleet_name",
                value_text: fleetName,
            },
            {
                key: "3",
                value: "duration",
                value_text: duration,
            },
            {
                key: "4",
                value: "start_sewa",
                value_text: startSewa,
            },
            {
                key: "5",
                value: "end_sewa",
                value_text: endSewa,
            }
        ]
    }
}

export const QONTAK_AFTER_SEWA = (customerName: string, units: string, hour: string) => {
    return {
        template_id: "b64bb0ed-ac94-4213-ae50-4e60ae34054c",
        body: [
            {
                key: "1",
                value: "customer_name",
                value_text: customerName,
            },
            {
                key: "2",
                value: "units",
                value_text: units,
            },
            {
                key: "3",
                value: "hour",
                value_text: hour,
            }
        ]
    }
}

export const QONTAK_BEFORE_SEWA = (orderDetail: string, hour: string) => {
    return {
        template_id: "7c3400e1-0c7a-4d2b-ad13-038887a71b2f",
        body: [
            {
                key: "1",
                value: "order_detail",
                value_text: orderDetail,
            },
            {
                key: "2",
                value: "hour",
                value_text: hour,
            }
        ]
    }
}

// export const QONTAK_VERIFIED_USER_MESSAGE = (link: string) => {
//     return {
//         template_id: "5c32f79f-1d58-4d5f-8d4e-89431ef4e24c",
//         body: [
//             {
//                 key: "1",
//                 value: "link",
//                 value_text: link,
//             }
//         ]
//     }
// }

export const QONTAK_REJECTED_USER_MESSAGE = (reason: string) => {
    return {
        template_id: "ab62a75f-4774-42df-9e21-78dabe3b5713",
        body: [
            {
                key: "1",
                value: "reason",
                value_text: reason,
            }
        ]
    }
}

export const QONTAK_CHANGES_ORDER_MESSAGE = (changes: string[], link: string) => {
    return {
        template_id: "3080da41-cbd4-4245-8f02-025f3539feb7",
        body: [
            {
                key: "1",
                value: "changes",
                value_text: (changes.map(change => ` - ${change}`).join('\n')).replace(/<b>/g, '').replace(/<\/b>/g, ''),
            },
            {
                key: "2",
                value: "link",
                value_text: link,
            }
        ]
    }
}

export const QONTAK_BIRTHDAY_DISCOUNT_MESSAGE = (name: string) => {
    return {
        template_id: "dd91d920-57fa-44da-b263-e0285ae2f5c9",
        body: [
            {
                key: "1",
                value: "name",
                value_text: name,
            }
        ]
    }
}

export const QONTAK_SERVICE_REMINDER_MESSAGE = (name: string, type: string, fleet_name: string, plate_number: string) => {
    return {
        template_id: "ff10e2b6-4053-4198-93bd-4e799f4b28fa",
        body: [
            {
                key: "1",
                value: "name",
                value_text: name,
            },
            {
                key: "2",
                value: "type",
                value_text: type,
            },
            {
                key: "3",
                value: "fleet_name",
                value_text: fleet_name,
            },
            {
                key: "4",
                value: "plate_number",
                value_text: plate_number,
            }
        ]
    }
}

export const QONTAK_FORGOT_PASSWORD = (link: string) => {
    return {
        template_id: "8295b028-f05b-481e-8926-7b9b0591973d",
        body: [
            {
                key: "1",
                value: "link",
                value_text: link,
            }
        ]
    }
}

export const QONTAK_CANCEL_ORDER_CONFIRMATION = (name: string, type: string, fleet_name: string, duration: string, start_sewa: string, end_sewa: string) => {
    return {
        template_id: "645e9f2c-5ef0-4cd3-af53-b4c6387fb852",
        body: [
            {
                key: "1",
                value: "name",
                value_text: name,
            },
            {
                key: "2",
                value: "type",
                value_text: type,
            },
            {
                key: "3",
                value: "fleet_name",
                value_text: fleet_name,
            },
            {
                key: "4",
                value: "duration",
                value_text: duration,
            },
            {
                key: "5",
                value: "start_sewa",
                value_text: start_sewa,
            },
            {
                key: "6",
                value: "end_sewa",
                value_text: end_sewa,
            }
        ]
    }
}

export const QONTAK_VERIFICATION_WITH_ADDITIONAL_DATA = (reason: string) => {
    return {
        template_id: "35dfe2e7-cff6-4b74-bde2-7d6d2b9aa92c",
        body: [
            {
                key: "1",
                value: "reason",
                value_text: reason,
            }
        ]
    }
}

export const QONTAK_WA_BLAS_PARTNER_DRIVER = (name: string, date: string, saldo: string, biaya_sewa: string, jumlah_kekurangan: string, jumlah_kelebihan: string) => {
    return {
        template_id: "832fcc24-fb39-4bf2-a004-261d0de60b42",
       body: [
            {
                key: "1",
                value: "name",
                value_text: name,
            },
            {
                key: "2",
                value: "date",
                value_text: date,
            },
            {
                key: "3",
                value: "saldo",
                value_text: saldo,
            },
            {
                key: "4",
                value: "biaya_sewa",
                value_text: biaya_sewa,
            },
            {
                key: "5",
                value: "kekurangan",
                value_text: jumlah_kekurangan,
            },
            {
                key: "6",
                value: "kelebihan",
                value_text: jumlah_kelebihan,
            }
        ]
    }
}

