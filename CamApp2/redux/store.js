import {createStore} from 'redux';
import paymentReceivedReducer from './reducer';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistStore, persistReducer} from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['paid'],
};

const persistedReducer = persistReducer(persistConfig, paymentReceivedReducer);

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);
