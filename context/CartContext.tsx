'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { CartCustomization } from '@/lib/kit';
import {
  CartItem,
  addToCart as reduxAddToCart,
  updateCartItem as reduxUpdateCartItem,
  removeFromCart as reduxRemoveFromCart,
  updateQuantity as reduxUpdateQuantity,
  clearCart as reduxClearCart,
  setIsCartOpen as reduxSetIsCartOpen,
  setCartItems,
} from '../store/slices/cartSlice';

interface CartContextType {
  cart: CartItem[];
  addToCart: (
    product: {
      id: string;
      name: string;
      price: number;
      image: string;
      theme?: string;
      lineId?: string;
      basePrice?: number;
      customization?: CartCustomization;
    },
    quantity?: number,
    openCart?: boolean,
  ) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  updateCartItem: (item: {
    id: string;
    price: number;
    basePrice?: number;
    customization?: CartCustomization;
  }) => void;
  clearCart: () => void;
  totalPrice: number;
  totalCount: number;
  isCartReady: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);
  const isCartOpen = useAppSelector((state) => state.cart.isCartOpen);
  const isLoadedRef = useRef(false);
  const [isCartReady, setIsCartReady] = useState(false);

  // 1. Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('kitsandcraft_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch(setCartItems(parsed));
        }
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage', e);
    } finally {
      isLoadedRef.current = true;
      setIsCartReady(true);
    }
  }, [dispatch]);

  // 2. Persist cart to localStorage whenever cart state updates
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      localStorage.setItem('kitsandcraft_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (
    product: {
      id: string;
      name: string;
      price: number;
      image: string;
      theme?: string;
      lineId?: string;
      basePrice?: number;
      customization?: CartCustomization;
    },
    qty = 1,
    openCart = false,
  ) => {
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
    const matches = cart.filter((item) => item.id === id || (item.lineId || item.id) === id);
    if (matches.length === 0) return;
    const quantity = matches.reduce((sum, item) => sum + item.quantity, 0);
    dispatch(reduxUpdateQuantity({ id: matches[0].id, quantity: quantity + delta }));
  };

  const updateCartItem = (item: {
    id: string;
    price: number;
    basePrice?: number;
    customization?: CartCustomization;
  }) => {
    dispatch(reduxUpdateCartItem(item));
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
        updateCartItem,
        clearCart,
        totalPrice,
        totalCount,
        isCartReady,
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
