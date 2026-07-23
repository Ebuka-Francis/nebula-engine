'use client';

import React from 'react';
import Link from 'next/link';

interface PredictionCardProps {
  categoryIcon: string;
  title: string;
  yesPercent: number;
  noPercent: number;
  volume: string;
  themeColor: 'cyan' | 'pink' | 'purple' | 'blue';
}

const predictionsData: PredictionCardProps[] = [
  {
    categoryIcon: '₿',
    title: 'Will Bitcoin hit $100K by June 30?',
    yesPercent: 70,
    noPercent: 30,
    volume: '$125,430',
    themeColor: 'cyan',
  },
  {
    categoryIcon: '⚽',
    title: 'Real Madrid to win Champions League?',
    yesPercent: 65,
    noPercent: 35,
    volume: '$99,221',
    themeColor: 'pink',
  },
  {
    categoryIcon: '♦️',
    title: 'Will ETH outperform BTC in Q2?',
    yesPercent: 55,
    noPercent: 45,
    volume: '$76,982',
    themeColor: 'purple',
  },
  {
    categoryIcon: '🇺🇸',
    title: 'US Elections: Will turnout exceed 60%?',
    yesPercent: 60,
    noPercent: 40,
    volume: '$43,291',
    themeColor: 'blue',
  },
  // Extra dummy cards to make the infinite scroll loop feel long and natural
  {
    categoryIcon: '🎮',
    title: 'GTA VI to be delayed to 2027?',
    yesPercent: 40,
    noPercent: 60,
    volume: '$88,150',
    themeColor: 'purple',
  },
  {
    categoryIcon: '🍎',
    title: 'Apple to release folding iPhone this year?',
    yesPercent: 25,
    noPercent: 75,
    volume: '$112,400',
    themeColor: 'pink',
  },
];

export default function TrendingPredictions() {
  // We duplicate the array to ensure a seamless visual loop during the scroll transition
  const doubledSlides = [...predictionsData, ...predictionsData];

  return (
    <section className="bg-[#08080d] py-12 px-6 md:px-16 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white text-lg sm:text-xl font-extrabold tracking-wider uppercase">
            Trending Predictions
          </h2>
          <Link 
            href="/predictions" 
            className="text-zinc-500 hover:text-zinc-300 text-xs sm:text-sm font-semibold transition-colors"
          >
            View all
          </Link>
        </div>

        {/* 
          Slider Viewport Wrapper
          - Mask-image creates a subtle fade effect on the left/right edges so cards fade out smoothly
        */}
        <div 
          className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]"
        >
          {/* Animated Track — Pauses on Hover */}
          <div className="flex gap-4 w-max animate-infinite-scroll hover:[animation-play-state:paused] py-2">
            {doubledSlides.map((prediction, index) => (
              <div 
                key={index} 
                className="w-[280px] sm:w-[320px] shrink-0"
              >
                <PredictionCard {...prediction} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Embedded Styles for the Auto-Scroll Keyframe Animation */}
      <style>{`
        @keyframes infiniteScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            /* Scroll exactly half the width of the doubled element track */
            transform: translateX(-50%);
          }
        }
        .animate-infinite-scroll {
          animation: infiniteScroll 25s linear infinite;
        }
      `}</style>
    </section>
  );
}

function PredictionCard({
  categoryIcon,
  title,
  yesPercent,
  noPercent,
  volume,
  themeColor,
}: PredictionCardProps) {
  
  const themeMap = {
    cyan: {
      iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
      yesText: 'text-emerald-400',
      noText: 'text-rose-400/80',
      barBg: 'bg-emerald-400',
    },
    pink: {
      iconBg: 'bg-zinc-800 text-white border-zinc-700/50',
      yesText: 'text-pink-400',
      noText: 'text-amber-500/80',
      barBg: 'bg-pink-400',
    },
    purple: {
      iconBg: 'bg-purple-950/20 text-purple-400 border-purple-500/20',
      yesText: 'text-purple-400',
      noText: 'text-rose-400/80',
      barBg: 'bg-purple-400',
    },
    blue: {
      iconBg: 'bg-blue-950/20 text-blue-400 border-blue-500/20',
      yesText: 'text-blue-400',
      noText: 'text-zinc-400',
      barBg: 'bg-blue-400',
    },
  };

  const currentTheme = themeMap[themeColor];

  return (
    <div className="h-full bg-[#100f16]/90 border border-zinc-900/80 hover:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:bg-[#14131c]">
      
      {/* Top: Icon & Title */}
      <div className="flex gap-4 items-start mb-6">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg border shrink-0 ${currentTheme.iconBg}`}>
          {categoryIcon}
        </div>
        <h3 className="text-zinc-200 text-sm font-semibold leading-snug line-clamp-2 pt-0.5">
          {title}
        </h3>
      </div>

      {/* Middle: Odds & Performance Bar */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-baseline font-bold text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-medium text-xs">Yes</span>
            <span className={currentTheme.yesText}>{yesPercent}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-medium text-xs">No</span>
            <span className={currentTheme.noText}>{noPercent}%</span>
          </div>
        </div>

        {/* Custom progress bar ratio layout */}
        <div className="w-full h-[3px] bg-zinc-800 rounded-full flex overflow-hidden">
          <div 
            className={`h-full rounded-l-full ${currentTheme.barBg}`} 
            style={{ width: `${yesPercent}%` }}
          />
          <div className="h-full bg-zinc-800" style={{ width: `${noPercent}%` }} />
        </div>
      </div>

      {/* Bottom: Volume indicators */}
      <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide">
        <span className="text-zinc-300">{volume}</span>
        <span className="text-zinc-600 font-semibold uppercase">Volume</span>
      </div>

    </div>
  );
}