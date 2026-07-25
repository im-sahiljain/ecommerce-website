'use me';
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { Brain, Smile, Plane, ShieldCheck, Heart, User, CheckCircle2 } from 'lucide-react';

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

export default function HomePage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(err => console.error('Failed to fetch products:', err));
  }, []);

  const getThemeProducts = (themeName: string) => {
    return products.filter(p => p.theme.toLowerCase().includes(themeName.toLowerCase())).slice(0, 2);
  };

  return (
    <div className="w-full bg-[#F9F9FF] font-quicksand overflow-x-hidden text-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-16 md:space-y-24">
        
        {/* 1. HERO SECTION */}
        <section className="bg-white rounded-[32px] p-6 sm:p-10 md:p-14 border border-slate-100 soft-shadow flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Hero Left Content */}
          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1E293B] tracking-tight leading-[1.15]">
              Paint Your World <br />
              <span className="text-[#1E293B]">with Little Creators!</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base md:text-lg max-w-md mx-auto md:mx-0 font-medium leading-relaxed">
              Complete ready-to-paint plaster craft kits designed for curious young minds.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <Link
                href="/shop"
                className="px-7 py-3.5 bg-[#FDE8E8] hover:bg-[#fbcaca] text-[#1E293B] font-bold text-sm rounded-full transition transform active:scale-95 shadow-xs"
              >
                Shop Painting Kits
              </Link>
              <Link
                href="/shop"
                className="px-7 py-3.5 bg-[#E0F2FE] hover:bg-[#bae6fd] text-[#1E293B] font-bold text-sm rounded-full transition transform active:scale-95 shadow-xs"
              >
                Explore Themes
              </Link>
            </div>
          </div>

          {/* Hero Right Banner Image */}
          <div className="w-full md:w-1/2 relative rounded-[28px] overflow-hidden shadow-sm border-4 border-white aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80"
              alt="Children painting plaster craft kits"
              className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
            />
          </div>
        </section>

        {/* 2. WHY LITTLE CREATORS? SECTION */}
        <section className="text-center space-y-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B]">Why Little Creators?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 soft-shadow hover:shadow-md transition text-center space-y-4">
              <div className="w-14 h-14 bg-[#FDE8E8] text-[#F472B6] rounded-2xl flex items-center justify-center mx-auto">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-[#1E293B]">Cognitive Growth</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Boosts creativity, focus, and fine motor skills through art.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 soft-shadow hover:shadow-md transition text-center space-y-4">
              <div className="w-14 h-14 bg-[#FEF08A] text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                <Smile className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-[#1E293B]">Screen-Free Fun</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Engaging, hands-on activity that keeps kids entertained.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-100 soft-shadow hover:shadow-md transition text-center space-y-4">
              <div className="w-14 h-14 bg-[#E0F2FE] text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
                <Plane className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-[#1E293B]">Travel-Friendly Hobby</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Portable kits perfect for vacations or quiet time anywhere.
              </p>
            </div>
          </div>
        </section>

        {/* 3. SPACE ADVENTURES SECTION */}
        <section className="bg-[#EEF2FF] rounded-[32px] p-6 sm:p-10 md:p-12 border border-indigo-100 relative overflow-hidden">
          {/* Space Vector Graphics */}
          <div className="absolute top-4 left-6 opacity-40 pointer-events-none hidden sm:block">
            <SaturnIcon className="w-16 h-16 text-indigo-400" />
          </div>
          <div className="absolute top-4 right-6 opacity-40 pointer-events-none hidden sm:block">
            <RocketIcon className="w-16 h-16 text-indigo-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] text-center mb-8 relative z-10">
            Space Adventures
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {(getThemeProducts('Space').length > 0 ? getThemeProducts('Space') : spaceFallback).map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={() => addToCart(p)} />
            ))}
          </div>
        </section>

        {/* 4. SECRET GARDEN (FLORAL) SECTION WITH DECORATIVE BORDER */}
        <section className="bg-[#F0FDF4] rounded-[32px] p-6 sm:p-10 md:p-12 border border-emerald-100 relative overflow-hidden">
          {/* Floral Vine Decorations */}
          <div className="absolute top-0 bottom-0 left-2 w-14 opacity-40 pointer-events-none hidden md:block">
            <FloralVineLeft className="h-full w-auto text-emerald-600" />
          </div>
          <div className="absolute top-0 bottom-0 right-2 w-14 opacity-40 pointer-events-none hidden md:block">
            <FloralVineRight className="h-full w-auto text-emerald-600" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] text-center mb-8 relative z-10">
            Secret Garden (Floral)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto relative z-10">
            {(getThemeProducts('Garden').length > 0 ? getThemeProducts('Garden') : gardenFallback).map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={() => addToCart(p)} />
            ))}
          </div>
        </section>

        {/* 5. FAIRYTALE MAGIC SECTION */}
        <section className="bg-[#FAF5FF] rounded-[32px] p-6 sm:p-10 md:p-12 border border-purple-100 relative overflow-hidden">
          {/* Castle Graphics */}
          <div className="absolute top-4 left-6 opacity-30 pointer-events-none hidden sm:block">
            <CastleIcon className="w-16 h-16 text-purple-400" />
          </div>
          <div className="absolute top-4 right-6 opacity-30 pointer-events-none hidden sm:block">
            <CrownIcon className="w-14 h-14 text-amber-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] text-center mb-8 relative z-10">
            Fairytale Magic
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto relative z-10">
            {(getThemeProducts('Fairytale').length > 0 ? getThemeProducts('Fairytale') : fairytaleFallback).map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={() => addToCart(p)} />
            ))}
          </div>
        </section>

        {/* 6. WILD KINGDOM SECTION */}
        <section className="bg-[#FEF3C7]/40 rounded-[32px] p-6 sm:p-10 md:p-12 border border-amber-100 relative overflow-hidden">
          {/* Paw & Leaf Graphics */}
          <div className="absolute bottom-4 left-6 opacity-30 pointer-events-none hidden sm:block">
            <PawIcon className="w-14 h-14 text-amber-600" />
          </div>
          <div className="absolute bottom-4 right-6 opacity-30 pointer-events-none hidden sm:block">
            <LeafIcon className="w-14 h-14 text-emerald-600" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] text-center mb-8 relative z-10">
            Wild Kingdom
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto relative z-10">
            {(getThemeProducts('Wild').length > 0 ? getThemeProducts('Wild') : wildFallback).map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={() => addToCart(p)} />
            ))}
          </div>
        </section>

        {/* 7. EXPLORE ALL THEMES BUTTON */}
        <div className="text-center pt-2">
          <Link
            href="/shop"
            className="inline-block px-10 py-4 bg-[#E0F2FE] hover:bg-[#bae6fd] text-[#1E293B] font-extrabold rounded-full text-base sm:text-lg shadow-xs hover:shadow transition transform active:scale-95"
          >
            Explore All Themes
          </Link>
        </div>

      </div>
    </div>
  );
}

{/* Product Card Component matching exact design image */}
function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: () => void }) {
  return (
    <div className="bg-white rounded-[28px] border border-slate-100 p-4 soft-shadow hover:shadow-md transition flex flex-col justify-between h-full text-center">
      <div>
        <div className="relative rounded-[20px] overflow-hidden mb-3 aspect-square bg-slate-50 border border-slate-100">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          
          {/* Badges matching design image */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            <span className="px-2.5 py-0.5 bg-[#E0F2FE] text-sky-800 rounded-full text-[10px] font-bold shadow-xs">
              {product.ageGroup || 'Ages 4+'}
            </span>
            {product.isNonToxic && (
              <span className="px-2.5 py-0.5 bg-[#DCFCE7] text-emerald-800 rounded-full text-[10px] font-bold shadow-xs">
                Non-Toxic
              </span>
            )}
          </div>
        </div>

        <Link href={`/product/${product.id}`} className="hover:text-pink-500 transition block">
          <h4 className="font-bold text-sm text-[#1E293B] line-clamp-1">{product.name}</h4>
        </Link>
        <p className="text-slate-500 font-extrabold text-sm mt-1">${product.price.toFixed(2)}</p>
      </div>

      <button
        onClick={onAddToCart}
        className="w-full mt-4 py-2.5 bg-[#FDE8E8] hover:bg-[#fbcaca] text-[#1E293B] font-bold rounded-full text-xs transition active:scale-95"
      >
        Add to Cart
      </button>
    </div>
  );
}

{/* Custom SVG Graphics */}
function SaturnIcon(props: any) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <circle cx="50" cy="50" r="26" />
      <ellipse cx="50" cy="50" rx="42" ry="10" fill="none" stroke="currentColor" strokeWidth="5" transform="rotate(-20 50 50)" />
    </svg>
  );
}

function RocketIcon(props: any) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <path d="M50 10 C65 35 65 65 50 85 C35 65 35 35 50 10 Z" />
      <circle cx="50" cy="40" r="7" fill="#fff" />
      <path d="M35 60 L15 80 L35 75 Z" />
      <path d="M65 60 L85 80 L65 75 Z" />
    </svg>
  );
}

function FloralVineLeft(props: any) {
  return (
    <svg viewBox="0 0 50 300" fill="currentColor" {...props}>
      <path d="M25 0 Q40 75 25 150 Q10 225 25 300" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="35" cy="40" r="8" />
      <circle cx="15" cy="120" r="8" />
      <circle cx="35" cy="200" r="8" />
    </svg>
  );
}

function FloralVineRight(props: any) {
  return (
    <svg viewBox="0 0 50 300" fill="currentColor" {...props}>
      <path d="M25 0 Q10 75 25 150 Q40 225 25 300" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="15" cy="40" r="8" />
      <circle cx="35" cy="120" r="8" />
      <circle cx="15" cy="200" r="8" />
    </svg>
  );
}

function CastleIcon(props: any) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <rect x="20" y="40" width="60" height="50" />
      <rect x="15" y="20" width="15" height="25" />
      <rect x="70" y="20" width="15" height="25" />
    </svg>
  );
}

function CrownIcon(props: any) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <polygon points="10,80 20,30 40,60 50,20 60,60 80,30 90,80" />
    </svg>
  );
}

function PawIcon(props: any) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <ellipse cx="50" cy="65" rx="18" ry="14" />
      <circle cx="30" cy="35" r="7" />
      <circle cx="45" cy="25" r="7" />
      <circle cx="65" cy="35" r="7" />
    </svg>
  );
}

function LeafIcon(props: any) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <path d="M50 10 C80 40 80 80 50 90 C20 80 20 40 50 10 Z" />
    </svg>
  );
}

/* Fallback Products matching exact image */
const spaceFallback: Product[] = [
  {
    id: 'prod-1',
    name: 'Galaxy Rocket Kit',
    price: 19.99,
    theme: 'Space Adventures',
    category: 'Painting Kits',
    ageGroup: 'Ages 4+',
    isNonToxic: true,
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500',
    description: 'Plaster rocket set.'
  },
  {
    id: 'prod-2',
    name: 'Planet Explorer Set',
    price: 24.99,
    theme: 'Space Adventures',
    category: 'Painting Kits',
    ageGroup: 'Ages 4+',
    isNonToxic: true,
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500',
    description: 'Solar system plaster planet set.'
  }
];

const gardenFallback: Product[] = [
  {
    id: 'prod-3',
    name: 'Butterfly & Bloom Kit',
    price: 19.99,
    theme: 'Secret Garden (Floral)',
    category: 'Painting Kits',
    ageGroup: 'Ages 4+',
    isNonToxic: true,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500',
    description: 'Butterfly plaster set.'
  },
  {
    id: 'prod-4',
    name: 'Enchanted Floral Set',
    price: 24.99,
    theme: 'Secret Garden (Floral)',
    category: 'Painting Kits',
    ageGroup: 'Ages 4+',
    isNonToxic: true,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500',
    description: 'Floral craft set.'
  }
];

const fairytaleFallback: Product[] = [
  {
    id: 'prod-5',
    name: 'Unicorn Dreams Kit',
    price: 19.99,
    theme: 'Fairytale Magic',
    category: 'Painting Kits',
    ageGroup: 'Ages 4+',
    isNonToxic: true,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500',
    description: 'Unicorn plaster set.'
  },
  {
    id: 'prod-6',
    name: 'Royal Castle Set',
    price: 14.99,
    theme: 'Fairytale Magic',
    category: 'Painting Kits',
    ageGroup: 'Ages 4+',
    isNonToxic: true,
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=500',
    description: 'Fairytale castle set.'
  }
];

const wildFallback: Product[] = [
  {
    id: 'prod-7',
    name: 'Safari Lion Kit',
    price: 19.99,
    theme: 'Wild Kingdom',
    category: 'Painting Kits',
    ageGroup: 'Ages 4+',
    isNonToxic: true,
    image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=500',
    description: 'Safari lion plaster set.'
  },
  {
    id: 'prod-8',
    name: 'Elephant Parade Set',
    price: 24.99,
    theme: 'Wild Kingdom',
    category: 'Painting Kits',
    ageGroup: 'Ages 4+',
    isNonToxic: true,
    image: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=500',
    description: 'Elephant family plaster set.'
  }
];
