'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { initializeAuthFromStorage } from './slices/authSlice';
import { fetchProducts } from './slices/productsSlice';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuthFromStorage());
    store.dispatch(fetchProducts());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
