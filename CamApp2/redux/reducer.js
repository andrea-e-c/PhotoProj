import {PAYMENT_RECEIVED} from './action';

const initialState = {
  paid: false,
};

const paymentReceivedReducer = (state = initialState, action) => {
  switch (action.type) {
    case PAYMENT_RECEIVED: {
      const {paid} = action.payload;
      return {
        ...state,
        paid: paid,
      };
    }
    default:
      return state;
  }
};

export default paymentReceivedReducer;
