"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <>
      {/* Newsletter Section matching home.html */}
      {/* <section className="bg-gray-50 py-20 font-quicksand">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-[#3C2A21] mb-4">Ready to Start the Fun?</h2>
          <p className="text-gray-600 mb-8">Join our community of little artists! Get 10% off your first order and exclusive craft ideas!</p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-10 text-sm font-semibold text-[#3C2A21]">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM6 8a2 2 0 11-4 0 2 2 0 014 0zM11 18a4.992 4.992 0 00-3.07-3.61c.27-.22.53-.47.78-.74.13-.14.23-.3.32-.47C9.1 13.05 9.49 13 10 13s.9.05 1.35.18c.13.04.26.09.38.15.25.13.48.28.69.45a4.992 4.992 0 00-3.07 3.61zM16.5 15.833A2.5 2.5 0 0013.5 13.334a4.962 4.962 0 011.5 3.166 2.5 2.5 0 001.5-.667zM3.5 15.833a2.5 2.5 0 011.5.667 4.962 4.962 0 011.5-3.166 2.5 2.5 0 00-3 2.5z"></path>
              </svg>
              <span>Over 10,000 Happy Little Artists!</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
              </svg>
              <span>Parent-Approved & Safe</span>
            </div>
          </div>

          {subscribed ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 font-bold text-sm rounded-full max-w-md mx-auto border border-emerald-200">
              🎉 Thank you for joining the Little Creators Club!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-grow px-6 py-4 rounded-full border border-gray-300 focus:ring-yellow-600 focus:border-yellow-600 text-sm"
                required
              />
              <button
                type="submit"
                className="bg-[#3C2A21] text-white px-10 py-4 rounded-full font-bold hover:bg-opacity-90 transition text-sm"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section> */}

      {/* Main Footer matching home.html */}
      <footer className="bg-white pt-16 pb-8 border-t border-gray-100 font-quicksand">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-bold text-xl mb-4 text-[#3C2A21]">
              Little Creators
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sparking joy through painting kits. Safe, fun, and creative
              plaster kits for kids.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-[#3C2A21]">Shop</h4>
            <ul className="text-gray-500 text-sm space-y-2">
              <li>
                <Link href="/shop" className="hover:text-[#3C2A21] transition">
                  All Kits
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=Party Packs"
                  className="hover:text-[#3C2A21] transition"
                >
                  Party Packs
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#3C2A21] transition">
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-[#3C2A21]">Support</h4>
            <ul className="text-gray-500 text-sm space-y-2">
              <li>
                <a href="#" className="hover:text-[#3C2A21] transition">
                  Safety Certifications
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#3C2A21] transition">
                  Customer Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#3C2A21] transition">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#3C2A21] transition">
                  Join the Creators Club
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#3C2A21] transition">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h4 className="font-bold mb-4 text-[#3C2A21]">Admin Panel</h4>
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noreferrer"
                className="inline-block px-4 py-2 bg-[#3C2A21] text-white text-xs font-bold rounded-full hover:bg-opacity-90 transition"
              >
                Open Admin Dashboard ↗
              </a>
            </div>

            <div className="flex space-x-3 mt-6">
              <a
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-yellow-100 text-xs text-gray-700 font-bold"
                href="#"
              >
                f
              </a>
              <a
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-yellow-100 text-xs text-gray-700 font-bold"
                href="#"
              >
                ig
              </a>
              <a
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-yellow-100 text-xs text-gray-700 font-bold"
                href="#"
              >
                p
              </a>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 pt-8 border-t border-gray-50 text-center md:text-left">
          <p className="text-gray-400 text-xs">
            © 2024 Little Creators. Sparking joy through painting kits.
          </p>
        </div>
      </footer>
    </>
  );
}
