"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function WhyCard({
  bg,
  iconSrc,
  title,
  desc,
}: {
  bg: string;
  iconSrc: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="p-6 sm:p-8 rounded-3xl text-center flex flex-col items-center justify-between h-full space-y-4"
      style={{ backgroundColor: bg }}
    >
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xs overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconSrc}
          alt={title}
          className="w-full h-full object-contain p-1"
        />
      </div>
      <div>
        <h3
          className="font-bold mb-2 text-lg sm:text-xl"
          style={{ color: "var(--color-secondary)" }}
        >
          {title}
        </h3>
        <p className="text-neutral-600 text-sm sm:text-base font-medium leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function WhySection() {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const cards = [
    {
      bg: "#EFF6FF",
      iconSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC05Fn2RrTeXXbi8ozDNSOEp966CdSel8NRXnfqnE_9L4NlK7VPfAnROXfVs27_LXYlXroCvXOKBtRvldzWFIKIOXjMeG-vykL9icHpUz1VPoqjgP4VRZQkfydZohsCGV0-Y-wgmD8RgcJJyPgDtNxJ-FrCfUXzGgppZfHLwG3-tN9CqL9oSFa1afF9CDibssiTAcWqya6Rxz1uSEQhlK-XhhUhO5-M5QrwnPj31iav7vovFVgnOAGdgfwi5bW4IPWFwXQfqC_wbEg",
      title: "Cognitive Growth",
      desc: "Boosts creativity, focus, and fine motor skills through art.",
    },
    {
      bg: "#FEFCE8",
      iconSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA1NgK7ZecsjWENFgT54D5Cv7_WmCJQmXcjVv2vDTOohUD08d6ixK0W8VSCjBec872DQ56yJRCZWjM3nMkcFbfrjffEBuqgP62_b3wdF1ffUSUaYQR2bWbjGsv5LqTUe4ePnMWCIgqEwQtyDbCtl00mUNAbqsSkubAEACbLuU0NWjKMcosJIMVAO6No4bjom5d37epqn_B2eymBS-0CFmPkuIIP6yljbIcbt0OLzKeSVZgWR4_BTe5Zipc8EKN83XAdX72AcsKH18A",
      title: "Screen-Free Fun",
      desc: "Engaging, hands-on activity that keeps kids entertained.",
    },
    {
      bg: "#FEF2F2",
      iconSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD-C7wnjb5D37c9ELK5XHJi86GQiHBzVQLW8RWz-gdqnMaiUrNUTdJpLkh5Z5nj0Q4-pfO_PX-yYZLgGq3VE6jjxtDZLjAQqp_Jt1cTRjszStJusR7U9b71bICgoXDP_DouaMmNbyV-g0htz3vzAvPTdsXS6ChxzsfF5ebH9KHSRUJaDAf2zyCuMUy-GqgQjvYQYu3eNvSihMnFVN5iW-QiHzcowhy97nhagNPl36Xbim3Xgrcr2oIdlioZDZNvIFjAYmvZkSIvD3M",
      title: "Travel-Friendly Hobby",
      desc: "Portable kits perfect for vacations or quiet time anywhere.",
    },
  ];

  return (
    <section style={{ backgroundColor: "white", padding: "64px 0" }}>
      <div className="max-w-7xl mx-auto px-6 relative">
        <h2
          className="text-center font-bold mb-10 text-3xl sm:text-4xl"
          style={{ color: "var(--color-secondary)" }}
        >
          Why Kits and Craft?
        </h2>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Scroll Left Arrow (Visible on Mobile) */}
          <button
            onClick={scrollLeft}
            aria-label="Scroll left"
            className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/90 shadow-md border border-neutral-200 text-secondary hover:bg-white active:scale-95 cursor-pointer -ml-3"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scroll Right Arrow (Visible on Mobile) */}
          <button
            onClick={scrollRight}
            aria-label="Scroll right"
            className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/90 shadow-md border border-neutral-200 text-secondary hover:bg-white active:scale-95 cursor-pointer -mr-3"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Scrollable Track */}
          <div
            ref={scrollRef}
            className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory no-scrollbar pb-4 md:pb-0 px-1"
          >
            {cards.map((card, idx) => (
              <div
                key={idx}
                className="w-[85vw] max-w-[320px] sm:w-[340px] md:w-auto shrink-0 md:shrink snap-center"
              >
                <WhyCard
                  bg={card.bg}
                  iconSrc={card.iconSrc}
                  title={card.title}
                  desc={card.desc}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
