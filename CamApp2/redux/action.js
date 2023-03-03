export const PAYMENT_RECEIVED = 'PAYMENT_RECEIVED';

export const addPaymentStatus = task => ({
  type: PAYMENT_RECEIVED,
  payload: {
    paid: task,
  },
});
