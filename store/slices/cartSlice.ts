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

function collapseCartItems(items: CartItem[]): CartItem[] {
  const seen = new Set<string>();
  const collapsed: CartItem[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    const matches = items.filter((entry) => entry.id === item.id);
    const latest = matches[matches.length - 1];
    collapsed.push({
      ...latest,
      lineId: item.id,
      quantity: matches.reduce((sum, entry) => sum + entry.quantity, 0),
    });
  }
  return collapsed;
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
      const id = action.payload.id;
      const matches = state.items.filter((item) => item.id === id);
      if (matches.length === 0) {
        state.items.push({
          id,
          lineId: id,
          name: action.payload.name,
          price: action.payload.price,
          basePrice: action.payload.basePrice,
          image: action.payload.image,
          customization: action.payload.customization,
          quantity: 1,
        });
        return;
      }
      const index = state.items.findIndex((item) => item.id === id);
      const keep = state.items[index];
      keep.quantity = matches.reduce((sum, item) => sum + item.quantity, 0) + 1;
      keep.lineId = id;
      keep.name = action.payload.name;
      keep.price = action.payload.price;
      keep.basePrice = action.payload.basePrice;
      keep.image = action.payload.image;
      keep.customization = action.payload.customization;
      state.items = state.items.filter((item, itemIndex) => item.id !== id || itemIndex === index);
    },
    updateCartItem: (state, action: PayloadAction<{
      id: string;
      price: number;
      basePrice?: number;
      customization?: CartCustomization;
    }>) => {
      const matches = state.items.filter((item) => item.id === action.payload.id);
      if (matches.length === 0) return;
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      const keep = state.items[index];
      keep.quantity = matches.reduce((sum, item) => sum + item.quantity, 0);
      keep.lineId = action.payload.id;
      keep.price = action.payload.price;
      keep.basePrice = action.payload.basePrice;
      keep.customization = action.payload.customization;
      state.items = state.items.filter(
        (item, itemIndex) => item.id !== action.payload.id || itemIndex === index,
      );
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload && cartItemKey(item) !== action.payload,
      );
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const matches = state.items.filter(
        (item) => item.id === action.payload.id || cartItemKey(item) === action.payload.id,
      );
      if (matches.length === 0) return;
      if (action.payload.quantity <= 0) {
        const ids = new Set(matches.map((item) => item.id));
        state.items = state.items.filter((item) => !ids.has(item.id));
        return;
      }
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id || cartItemKey(item) === action.payload.id,
      );
      const keep = state.items[index];
      keep.quantity = action.payload.quantity;
      keep.lineId = keep.id;
      state.items = state.items.filter((item, itemIndex) => item.id !== keep.id || itemIndex === index);
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = collapseCartItems(action.payload);
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

export const { addToCart, updateCartItem, removeFromCart, updateQuantity, setCartItems, clearCart, setIsCartOpen, toggleCart } = cartSlice.actions;

export default cartSlice.reducer;
