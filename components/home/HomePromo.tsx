import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HomePromo() {
  return (
    <>
      <div className="flex justify-center py-10 relative z-20">
        <Link
          href="/shop"
          className="text-white rounded-full font-extrabold shadow-xl uppercase tracking-wider inline-flex items-center space-x-2 px-8 py-3.5 text-xs sm:text-sm bg-linear-to-r from-indigo-500 via-primary to-warning-500 hover:opacity-95 transition transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
        >
          <span>Explore All Themes</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-linear-to-r from-pink-200 via-yellow-200 to-sky-200 p-8 sm:p-10 rounded-3xl text-center space-y-4 shadow-sm border border-slate-100">
          <Sparkles className="w-10 h-10 text-pink-600 mx-auto" />
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Build Your Custom Craft Package
          </h3>
          <p className="text-xs sm:text-sm text-neutral-700 max-w-xl mx-auto">
            Build your custom offer of plaster figurines and POP painting kits
            to receive exclusive package discounts at checkout.
          </p>
          <Link
            href="/offers"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-neutral-800 hover:bg-neutral-900 text-white font-extrabold text-xs rounded-full shadow-sm transition cursor-pointer"
          >
            <span>Start Building Package</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      </section>
    </>
  );
}
