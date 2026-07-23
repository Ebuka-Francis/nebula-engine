'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Tournament {
  id: string;
  title: string;
  buyIn: string;
  status: 'Live' | 'Late Reg';
  statusColor: string; // Tailwind class color for status pill
  themeColor: string; // Tailwind class color for card hover/glow effects
  borderColor: string; // Custom glow border
  timeLeft: number; // In seconds
  registered: number;
  maxPlayers: number;
  prizePool: string;
  prizeColor: string;
  imageBg: string; // Placeholder CSS gradient matching the card's theme
}

const DUMMY_TOURNAMENTS: Tournament[] = [
  {
    id: '1',
    title: '$10K Nebula Series',
    buyIn: '50 USDC',
    status: 'Live',
    statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    themeColor: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/40',
    borderColor: 'border-emerald-500/20',
    timeLeft: 8134, // 02:15:34
    registered: 1250,
    maxPlayers: 2000,
    prizePool: '$10,000',
    prizeColor: 'text-emerald-400',
    imageBg: 'from-emerald-500/20 to-purple-900/10',
  },
  {
    id: '2',
    title: 'Friday NLH Special',
    buyIn: '20 USDC',
    status: 'Late Reg',
    statusColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    themeColor: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:border-amber-500/40',
    borderColor: 'border-amber-500/20',
    timeLeft: 3921, // 01:05:21
    registered: 720,
    maxPlayers: 1000,
    prizePool: '$5,000',
    prizeColor: 'text-amber-400',
    imageBg: 'from-amber-500/20 to-pink-900/10',
  },
  {
    id: '3',
    title: 'Sunday High Roller',
    buyIn: '100 USDC',
    status: 'Live',
    statusColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    themeColor: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-cyan-500/40',
    borderColor: 'border-cyan-500/20',
    timeLeft: 13330, // 03:42:10
    registered: 210,
    maxPlayers: 500,
    prizePool: '$50,000',
    prizeColor: 'text-cyan-400',
    imageBg: 'from-cyan-500/20 to-blue-950/25',
  },
  {
    id: '4',
    title: 'Micro Bounty',
    buyIn: '5 USDC',
    status: 'Late Reg',
    statusColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    themeColor: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:border-orange-500/40',
    borderColor: 'border-orange-500/20',
    timeLeft: 2711, // 00:45:11
    registered: 2100,
    maxPlayers: 3000,
    prizePool: '$3,000',
    prizeColor: 'text-orange-400',
    imageBg: 'from-orange-500/20 to-red-950/20',
  },
  {
    id: '5',
    title: 'Super Nebula Bounty',
    buyIn: '25 USDC',
    status: 'Live',
    statusColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    themeColor: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:border-purple-500/40',
    borderColor: 'border-purple-500/20',
    timeLeft: 6250,
    registered: 480,
    maxPlayers: 800,
    prizePool: '$8,000',
    prizeColor: 'text-purple-400',
    imageBg: 'from-purple-500/20 to-fuchsia-950/20',
  }
];

export default function LiveTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>(DUMMY_TOURNAMENTS);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Live Timer Effect to make elements dynamic immediately
  useEffect(() => {
    const interval = setInterval(() => {
      setTournaments((prev) =>
        prev.map((t) => ({
          ...t,
          timeLeft: t.timeLeft > 0 ? t.timeLeft - 1 : 0,
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
  };

  // Slider controls
  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - (clientWidth / 1.5) 
        : scrollLeft + (clientWidth / 1.5);
      
      sliderRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="bg-[#08080d] px-6 md:px-16 py-12 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-widest text-white font-sans">
              Live Tournaments
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <Link 
              href="/tournament" 
              className="text-xs text-zinc-400 hover:text-white font-semibold uppercase tracking-wider transition-colors"
            >
              View all
            </Link>
            
            {/* Slider Navigation Controls */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-lg bg-[#141218] border border-white/5 hover:border-white/20 text-zinc-400 hover:text-white transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-lg bg-[#141218] border border-white/5 hover:border-white/20 text-zinc-400 hover:text-white transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Slider */}
        <div 
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className={`flex-none w-[290px] sm:w-[320px] snap-start bg-[#121016]/90 border ${tournament.borderColor} rounded-2xl p-5 flex flex-col justify-between h-[190px] transition-all duration-300 relative overflow-hidden group ${tournament.themeColor}`}
            >
              {/* Card Graphical Background Glow */}
              <div className={`absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-gradient-to-tr ${tournament.imageBg} blur-[40px] opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

              {/* Top Row: Title, Buy-in & Icon */}
              <div className="relative z-10">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-white font-bold text-[15px] sm:text-base leading-tight truncate max-w-[190px] sm:max-w-[210px]">
                      {tournament.title}
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1">
                      Buy-in: <span className="text-zinc-300 font-semibold">{tournament.buyIn}</span>
                    </p>
                  </div>
                  {/* Subtle poker chip or chevron icon element */}
                  <span className="text-white/15 group-hover:text-white/30 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>

                {/* Middle Row: Status Badge and Timer */}
                <div className="flex items-center gap-3 mt-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${tournament.statusColor}`}>
                    {tournament.status}
                  </span>
                  <span className="text-white font-mono font-semibold text-sm tracking-widest">
                    {formatTime(tournament.timeLeft)}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Registered Ratio & Prize Pool */}
              <div className="flex justify-between items-end relative z-10 pt-4 border-t border-white/[0.05]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block tracking-wider">Players</span>
                  <span className="text-zinc-200 font-medium text-[13px]">
                    <strong className="text-white font-bold">{tournament.registered.toLocaleString()}</strong>
                    <span className="text-zinc-500"> / {tournament.maxPlayers.toLocaleString()}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block tracking-wider">Prize Pool</span>
                  <span className={`font-extrabold text-base ${tournament.prizeColor}`}>
                    {tournament.prizePool}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}