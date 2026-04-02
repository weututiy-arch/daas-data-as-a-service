/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const EXCHANGE_RATE = 83;
export const CURRENCY_SYMBOL = '₹';
export const COURSE_PAYMENT_URL = 'https://razorpay.me/@getdata';

export const formatCurrency = (amount: number) => {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN')}`;
};
