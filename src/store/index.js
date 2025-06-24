import { configureStore } from '@reduxjs/toolkit';
import { clientsApi } from './clientsApi';

const store = configureStore({
  reducer: {
    [clientsApi.reducerPath]: clientsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(clientsApi.middleware),
});

export default store;
