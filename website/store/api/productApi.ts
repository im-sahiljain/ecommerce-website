import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ProductCatalogItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  theme: string;
  category: string;
  ageGroup: string;
  isNonToxic: boolean;
  image: string;
  description: string;
  inStock?: boolean;
  featured?: boolean;
}

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/' 
  }),
  keepUnusedDataFor: 60, // Retain entries in memory for 60s
  refetchOnMountOrArgChange: false, // Prevent duplicate refetches within view cycles
  endpoints: (builder) => ({
    getProducts: builder.query<ProductCatalogItem[], { theme?: string; category?: string; ageGroup?: string }>({
      query: (params) => ({
        url: 'products',
        params,
      }),
    }),
    getProductById: builder.query<ProductCatalogItem, string>({
      query: (id) => `products/${id}`,
    }),
  }),
});

export const { useGetProductsQuery, useGetProductByIdQuery } = productApi;
