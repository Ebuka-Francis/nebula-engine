'use client'
import React, { useState } from 'react';
import { 
  Home, 
  Trophy, 
  TrendingUp, 
  Coins, 
  BarChart2, 
  Wallet, 
  User, 
  Settings, 
  Search, 
  SlidersHorizontal 
} from 'lucide-react';

// --- TypeScript Interfaces ---
interface Tournament {
  id: string;
  name: string;
  logo: string; // URL or emoji placeholder
  buyIn: number;
  currentPlayers: number;
  maxPlayers: number;
  prizePool: string;
  startsIn: string;
  status: 'Live' | 'Late Reg.' | 'Upcoming';
}

// --- Mock Data ---
const TOURNAMENTS_DATA: Tournament[] = [
  { id: '1', name: '$10K Nebula Series', logo: '🟢', buyIn: 50, currentPlayers: 1250, maxPlayers: 2000, prizePool: '$10,000', startsIn: '02:15:34', status: 'Live' },
  { id: '2', name: 'Friday NLH Special', logo: '🟢', buyIn: 20, currentPlayers: 720, maxPlayers: 1000, prizePool: '$5,000', startsIn: '01:05:21', status: 'Late Reg.' },
  { id: '3', name: 'Sunday High Roller', logo: '🟠', buyIn: 100, currentPlayers: 210, maxPlayers: 500, prizePool: '$50,000', startsIn: '03:42:10', status: 'Live' },
  { id: '4', name: 'Micro Bounty', logo: '🔵', buyIn: 5, currentPlayers: 2100, maxPlayers: 3000, prizePool: '$3,000', startsIn: '00:45:11', status: 'Late Reg.' },
  { id: '5', name: 'Satellite to $10K', logo: '🔺', buyIn: 10, currentPlayers: 150, maxPlayers: 300, prizePool: '5 Seats', startsIn: '01:15:00', status: 'Upcoming' },
  { id: '6', name: 'Nebula Women Special', logo: '🟣', buyIn: 15, currentPlayers: 340, maxPlayers: 500, prizePool: '$2,500', startsIn: '02:05:00', status: 'Upcoming' },
];

export default function TournamentDashboard() {
  const [activeTab, setActiveTab] = useState<'All' | 'Live' | 'Upcoming' | 'Completed'>('All');

  return (
    <div className="flex min-h-screen bg-[#09080d] text-gray-300 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#0d0b14] border-r border-[#1a1625] flex flex-col justify-between p-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="h-8 w-8 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-white font-bold uppercase tracking-wider text-sm leading-tight">Nebula</h1>
              <p className="text-xs text-purple-400 font-semibold tracking-widest uppercase">Engine</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <SidebarLink href="/" icon={<Home size={18} />} label="Home" />
            <SidebarLink icon={<Trophy size={18} />} label="Tournaments" active />
            <SidebarLink icon={<TrendingUp size={18} />} label="Predict" />
            <SidebarLink icon={<Coins size={18} />} label="Bounties" />
            <SidebarLink icon={<BarChart2 size={18} />} label="Leaderboard" />
            <SidebarLink icon={<Wallet size={18} />} label="Wallet" />
            <SidebarLink icon={<User size={18} />} label="Profile" />
            <SidebarLink icon={<Settings size={18} />} label="Settings" />
          </nav>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-8">
        
        {/* Top Header Row */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-wide">Tournaments</h2>
          
          {/* User Balance & Profile */}
          <div className="flex items-center gap-4">
            <div className="bg-[#13111c] border border-[#221e33] rounded-full py-1.5 px-4 flex items-center gap-2 shadow-inner">
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">C</div>
              <span className="text-white font-medium text-sm">2,450.50 <span className="text-gray-400 text-xs">USDC</span></span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" 
              alt="User Avatar" 
              className="w-9 h-9 rounded-full object-cover border-2 border-purple-500/30"
            />
          </div>
        </header>

        {/* Filters & Search Sub-Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          {/* Tabs */}
          <div className="flex gap-2 bg-[#0d0b14] p-1 rounded-full border border-[#1a1625]">
            {(['All', 'Live', 'Upcoming', 'Completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  activeTab === tab 
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search and Action Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search tournaments..." 
                className="bg-[#0d0b14] border border-[#1a1625] text-xs text-gray-200 rounded-lg pl-9 pr-4 py-2 w-60 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-600/10">
              <SlidersHorizontal size={14} />
              Filter
            </button>
          </div>
        </div>

        {/* --- TOURNAMENTS TABLE --- */}
        <div className="bg-[#0d0b14] border border-[#1a1625] rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1a1625] text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                <th className="py-4 px-6">Tournament</th>
                <th className="py-4 px-4">Buy-In</th>
                <th className="py-4 px-4">Players</th>
                <th className="py-4 px-4">Prize Pool</th>
                <th className="py-4 px-4">Starts In</th>
                <th className="py-4 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1625]/40 text-sm">
              {TOURNAMENTS_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-[#13111c]/50 transition-colors group">
                  {/* Title & Badge */}
                  <td className="py-4 px-6 flex items-center gap-3 font-medium text-white group-hover:text-purple-300 transition-colors">
                    <span className="text-lg w-7 h-7 bg-[#171424] rounded-md flex items-center justify-center border border-[#27223b]">{item.logo}</span>
                    {item.name}
                  </td>
                  {/* Buy-in */}
                  <td className="py-4 px-4 text-gray-300">
                    <span className="font-semibold text-white">{item.buyIn}</span> <span className="text-xs text-gray-500">USDC</span>
                  </td>
                  {/* Players Ratio */}
                  <td className="py-4 px-4 text-gray-400">
                    <span className="text-gray-200 font-medium">{item.currentPlayers.toLocaleString()}</span>
                    <span className="text-gray-600"> / {item.maxPlayers.toLocaleString()}</span>
                  </td>
                  {/* Prize Pool */}
                  <td className="py-4 px-4 font-semibold text-white">
                    {item.prizePool}
                  </td>
                  {/* Timer */}
                  <td className="py-4 px-4 font-mono text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
                    {item.startsIn}
                  </td>
                  {/* Status Pills */}
                  <td className="py-4 px-6 text-right">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}

// --- Helper Sub-Components ---
interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href?: string;
}

function SidebarLink({ icon, label, active,href }: SidebarLinkProps) {
  return (
    <a 
      href={href} 
      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 ${
        active 
          ? 'bg-[#1b152e] text-purple-400 border border-purple-500/20 shadow-inner' 
          : 'text-gray-500 hover:text-gray-300 hover:bg-[#13111c]/50'
      }`}
    >
      <span className={active ? 'text-purple-400' : 'text-gray-600'}>{icon}</span>
      {label}
    </a>
  );
}

function StatusBadge({ status }: { status: Tournament['status'] }) {
  const styles = {
    'Live': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    'Late Reg.': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    'Upcoming': 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${styles[status]}`}>
      {status === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      {status}
    </span>
  );
}