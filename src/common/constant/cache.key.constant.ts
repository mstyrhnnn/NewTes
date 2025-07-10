export const REQUEST_CACHE_COUNT_KEY = 'request_status_count';

export const ORDER_CACHE_COUNT_KEY = (status: string) =>
  `order_status_count_${status}`;
export const REIMBURSE_CACHE_COUNT_KEY = (status: string) =>
  `reimburse_status_count_${status}`;

export const USER_CACHE_COUNT_KEY = (role: string) =>
  `user_status_count_${role}`;
