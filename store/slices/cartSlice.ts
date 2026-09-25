import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartCustomization } from '@/lib/kit';

export interface CartItem {
  id: string;
  lineId?: string;
  name: string;
  price: number;
  basePrice?: number;
  image: string;
  quantity: number;
  customization?: CartCustomization;
}

export function cartItemKey(item: { id: string; lineId?: string }) {
  return item.lineId || item.id;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isCartOpen: false,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{
      id: string;
      lineId?: string;
      name: string;
      price: number;
      basePrice?: number;
      image: string;
      customization?: CartCustomization;
    }>) => {
      const lineId = action.payload.lineId || action.payload.id;
      const existing = state.items.find((item) => cartItemKey(item) === lineId);
      if (existing) {
        existing.quantity += 1;
        existing.price = action.payload.price;
        existing.customization = action.payload.customization;
      } else {
        state.items.push({
          id: action.payload.id,
          lineId,
          name: action.payload.name,
          price: action.payload.price,
          basePrice: action.payload.basePrice,
          image: action.payload.image,
          customization: action.payload.customization,
          quantity: 1,
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => cartItemKey(item) !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((entry) => cartItemKey(entry) === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((entry) => cartItemKey(entry) !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload.map((item) => ({
        ...item,
        lineId: item.lineId || item.id,
      }));
    },
    clearCart: (state) => {
      state.items = [];
    },
    setIsCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartOpen = action.payload;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, setCartItems, clearCart, setIsCartOpen, toggleCart } = cartSlice.actions;

export default cartSlice.reducer;
