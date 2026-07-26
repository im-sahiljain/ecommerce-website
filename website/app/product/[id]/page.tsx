'use me';
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import { ShieldCheck, Sparkles, Minus, Plus, ShoppingBag, Truck, RotateCcw, Award, MessageCircle, Heart } from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  theme: string;
  category: string;
  ageGroup: string;
  isNonToxic: boolean;
  image: string;
  images?: string[];
  description: string;
  inStock: boolean;
  isOrderingEnabled?: boolean;
  attributes?: Record<string, string>;
}

interface SiteSettings {
  isGlobalOrderingEnabled: boolean;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.json())
      .then(data => { if (data) setSettings(data); })
      .catch(() => {});
  }, [id]);

  const handleLikeToggle = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdentifier: 'guest' })
      });
      if (res.ok) {
        const data = await res.json();
        setLikesCount(data.likes);
        setIsLiked(data.isLiked);
      }
    } catch (err) {
      console.warn('Like toggle failed:', err);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-slate-500 font-bold">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white text-center rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg text-slate-800">Product Not Found</h3>
        <p className="text-xs text-slate-500 mt-2">The product set you are looking for does not exist or was moved.</p>
      </div>
    );
  }

  const isOrderingAllowed = (settings?.isGlobalOrderingEnabled ?? true) && (product.isOrderingEnabled ?? true);
  const phoneClean = (settings?.whatsappNumber || '+919876543210').replace(/[^0-9]/g, '');
  const productUrl = `http://localhost:3000/product/${product.id}`;
  const rawMessage = (settings?.whatsappMessageTemplate || 'Hi! I am interested in {productName} ({productUrl}).')
    .replace('{productName}', product.name)
    .replace('{productUrl}', productUrl);
  const whatsappUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(rawMessage)}`;

  // Google JSON-LD Product Schema for SEO Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: [product.image],
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Little Creators'
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 soft-shadow grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image & Badges */}
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden aspect-square bg-slate-50 border border-slate-100">
              <img
                src={product.images && product.images.length > 0 ? (product.images[selectedImgIndex] || product.image) : product.image}
                alt={product.name}
                className="w-full h-full object-cover transition duration-300"
              />
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                <span className="px-3.5 py-1.5 bg-sky-100 text-sky-800 rounded-full text-xs font-bold shadow-xs">
                  {product.ageGroup}
                </span>
                {product.isNonToxic && (
                  <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold shadow-xs flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4 inline" />
                    <span>100% Non-Toxic</span>
                  </span>
                )}
              </div>

              {/* Wishlist/Like Button */}
              <button
                onClick={handleLikeToggle}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-xs transition shadow-sm ${
                  isLiked ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-600 hover:text-rose-500'
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Gallery Thumbnails List */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center space-x-3 overflow-x-auto pb-1">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIndex(idx)}
                    className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                      selectedImgIndex === idx ? 'border-pink-500 scale-105 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-pink-500 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>{product.theme} • {product.category}</span>
              </div>

              <h1 className="text-3xl font-extrabold text-slate-800 leading-tight">{product.name}</h1>

              <div className="flex items-baseline space-x-3 mt-3">
                <span className="text-3xl font-extrabold text-slate-900">₹{product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-lg font-medium text-slate-400 line-through">₹{product.originalPrice.toFixed(2)}</span>
                )}
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mt-4 font-medium">{product.description}</p>

              {/* Product Attributes (Candle Scent / Burn Time) */}
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  {Object.entries(product.attributes).map(([key, val]) => (
                    <div key={key} className="flex justify-between font-semibold">
                      <span className="text-slate-500">{key}:</span>
                      <span className="text-slate-800 font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6 pt-4 border-t border-slate-100">
              {isOrderingAllowed ? (
                <>
                  {/* Quantity Selector */}
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity:</span>
                    <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-full p-1">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 shadow-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm w-6 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => q + 1)}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart CTA */}
                  <button
                    onClick={() => addToCart(product, quantity)}
                    className="w-full py-4 bg-pink-300 hover:bg-pink-400 text-slate-800 font-extrabold text-base rounded-full flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition transform active:scale-98"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Basket — ₹{(product.price * quantity).toFixed(2)}</span>
                  </button>
                </>
              ) : (
                /* WhatsApp Order Link when Online Ordering is Disabled */
                <div className="space-y-3 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                  <p className="text-xs font-bold text-amber-800">Online checkout paused for this item.</p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-full flex items-center justify-center space-x-2 shadow transition"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Order / Inquire via WhatsApp</span>
                  </a>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 text-center border-t border-slate-100 text-[11px] font-bold text-slate-600">
                <div className="p-2 bg-slate-50 rounded-2xl flex flex-col items-center justify-center">
                  <Truck className="w-4 h-4 text-sky-500 mb-1" />
                  <span>Fast Shipping</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-2xl flex flex-col items-center justify-center">
                  <Award className="w-4 h-4 text-yellow-500 mb-1" />
                  <span>Safe Materials</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-2xl flex flex-col items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-emerald-500 mb-1" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
