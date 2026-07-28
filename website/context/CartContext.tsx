'use client';

import React, { createContext, useContext } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  CartItem,
  addToCart as reduxAddToCart,
  removeFromCart as reduxRemoveFromCart,
  updateQuantity as reduxUpdateQuantity,
  clearCart as reduxClearCart,
  setIsCartOpen as reduxSetIsCartOpen,
} from '../store/slices/cartSlice';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: { id: string; name: string; price: number; image: string; theme?: string }, quantity?: number, openCart?: boolean) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);
  const isCartOpen = useAppSelector((state) => state.cart.isCartOpen);

  const addToCart = (product: { id: string; name: string; price: number; image: string; theme?: string }, qty = 1, openCart = false) => {
    for (let i = 0; i < qty; i++) {
      dispatch(reduxAddToCart(product));
    }
    if (openCart) {
      dispatch(reduxSetIsCartOpen(true));
    }
  };

  const removeFromCart = (id: string) => {
    dispatch(reduxRemoveFromCart(id));
  };

  const updateQuantity = (id: string, delta: number) => {
    const existing = cart.find((item) => item.id === id);
    if (existing) {
      dispatch(reduxUpdateQuantity({ id, quantity: existing.quantity + delta }));
    }
  };

  const clearCart = () => dispatch(reduxClearCart());
  const setIsCartOpen = (open: boolean) => dispatch(reduxSetIsCartOpen(open));

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalPrice,
        totalCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
