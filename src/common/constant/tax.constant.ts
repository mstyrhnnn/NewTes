require('dotenv').config();

// export const PPH_21_25_GROSS_UP = 0.02564103;
export const PPH_21_25_GROSS_UP = 0;
export const PPH_21_25_ID = '82e1f1bf-2022-44c7-8175-f01bcc3ba603';

export const PPH_21_25_ID_STG = 'a9a9a4bb-0d36-4198-9d89-574f7d295871';

export const PPH_21_25_ID_ENV
    = process.env.NODE_ENV === 'production' ? PPH_21_25_ID : PPH_21_25_ID_STG;