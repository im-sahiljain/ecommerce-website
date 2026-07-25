'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store/store';
import { Filter, ShieldCheck, Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  theme: string;
  category: string;
  ageGroup: string;
  isNonToxic: boolean;
  image: string;
  description: string;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialTheme = searchParams.get('theme') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialAge = searchParams.get('ageGroup') || '';

  const { addToCart } = useCart();
  const reduxProducts = useAppSelector((state: RootState) => state.products.items);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedAge, setSelectedAge] = useState(initialAge);
  const [sortOrder, setSortOrder] = useState<'default' | 'low-to-high' | 'high-to-low'>('default');

  useEffect(() => {
    if (reduxProducts.length > 0) {
      setProducts(reduxProducts);
    } else {
      fetch('http://localhost:5000/api/products')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setProducts(data);
        })
        .catch(() => {});
    }
  }, [reduxProducts]);

  const themes = ['Space Adventures', 'Secret Garden (Floral)', 'Fairytale Magic', 'Wild Kingdom'];
  const categories = ['Painting Kits', 'Party Packs', 'Plaster Sets', 'New Arrivals'];
  const ageGroups = ['Ages 2-4', 'Ages 4+', 'Ages 8+'];

  let filtered = products.filter(p => {
    if (selectedTheme && p.theme.toLowerCase() !== selectedTheme.toLowerCase()) return false;
    if (selectedCategory && p.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (selectedAge && p.ageGroup.toLowerCase() !== selectedAge.toLowerCase()) return false;
    return true;
  });

  if (sortOrder === 'low-to-high') {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'high-to-low') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-pink-100/70 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between border border-pink-200/60">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Shop All Craft Kits</h1>
          <p className="text-slate-600 text-sm mt-1">Discover non-toxic plaster painting sets designed for endless creativity.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2 text-xs font-bold text-slate-700 bg-white px-4 py-2 rounded-full shadow-xs">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span>{filtered.length} Craft Kits Available</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 soft-shadow space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 font-bold text-slate-800 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-pink-500" />
                <span>Filters</span>
              </div>
              {(selectedTheme || selectedCategory || selectedAge) && (
                <button
                  onClick={() => {
                    setSelectedTheme('');
                    setSelectedCategory('');
                    setSelectedAge('');
                  }}
                  className="text-[11px] font-bold text-pink-500 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Themes Filter */}
            <div>
              <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider mb-2">Themes</h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedTheme('')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    selectedTheme === '' ? 'bg-pink-100 text-slate-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Themes
                </button>
                {themes.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTheme(t)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      selectedTheme === t ? 'bg-pink-100 text-slate-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Filter */}
            <div>
              <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider mb-2">Category</h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === '' ? 'bg-sky-100 text-slate-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      selectedCategory === c ? 'bg-sky-100 text-slate-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Group Filter */}
            <div>
              <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider mb-2">Age Group</h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedAge('')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    selectedAge === '' ? 'bg-yellow-100 text-slate-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Ages
                </button>
                {ageGroups.map(a => (
                  <button
                    key={a}
                    onClick={() => setSelectedAge(a)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      selectedAge === a ? 'bg-yellow-100 text-slate-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">Showing <strong className="text-slate-800">{filtered.length}</strong> items</span>
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="default">Sort by Featured</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-100">
              <p className="text-slate-600 font-bold">No craft kits found matching your filters.</p>
              <button
                onClick={() => {
                  setSelectedTheme('');
                  setSelectedCategory('');
                  setSelectedAge('');
                }}
                className="mt-4 px-6 py-2.5 bg-pink-100 text-slate-800 font-bold text-xs rounded-full"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(product => (
                <div key={product.id} className="bg-white rounded-3xl border border-slate-100 p-4 soft-shadow soft-shadow-hover transition flex flex-col justify-between">
                  <div>
                    <div className="relative rounded-2xl overflow-hidden mb-3 aspect-square bg-slate-50">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex flex-col space-y-1">
                        <span className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-full text-[10px] font-bold shadow-xs">
                          {product.ageGroup}
                        </span>
                        {product.isNonToxic && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold shadow-xs flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3 inline" />
                            <span>Non-Toxic</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-500">{product.theme}</span>
                    <Link href={`/product/${product.id}`} className="hover:text-pink-500 transition block">
                      <h4 className="font-bold text-sm text-slate-800 line-clamp-1 mt-0.5">{product.name}</h4>
                    </Link>
                    <p className="text-slate-500 font-extrabold text-sm mt-1">${product.price.toFixed(2)}</p>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full mt-4 py-2.5 bg-pink-100 hover:bg-pink-200 text-slate-800 font-bold rounded-full text-xs transition active:scale-95"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-slate-500">Loading craft kits...</div>}>
      <ShopContent />
    </Suspense>
  );
}
