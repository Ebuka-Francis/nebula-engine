'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
   Bell,
   Check,
   CircleUser,
   Copy,
   LogOut,
   Menu,
   Sparkles,
   User,
   X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';

import UsernameModal from '../modals/UsernameModal';
import AuthModal from '../auth/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { getPlayer } from '@/lib/playerService';
import Image from 'next/image';

const ACTIVE_BOUNTIES = [
   { id: 1, label: 'Eliminate Player_Rho', reward: '3.2 SOL' },
   { id: 2, label: 'Win Table 3', reward: '1.8 SOL' },
   { id: 3, label: 'Survive to Final Table', reward: '2.5 SOL' },
];

const navLinks = [
   { name: 'Tournaments', href: '/tournament-dash' },
   { name: 'Predict', href: '/predict' },
   { name: 'Bounties', href: '/bounties' },
   { name: 'Leaderboard', href: '/leaderboard' },
   { name: 'Learn', href: '/learn' },
];

export default function TopNav() {
   const pathname = usePathname();

   const { user, loading: authLoading, logout } = useAuth();
   const { address, isConnected } = useAccount();
   const { disconnect } = useDisconnect();

   const [menuOpen, setMenuOpen] = useState(false);
   const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(
      null
   );
   const [showUsernameModal, setShowUsernameModal] = useState(false);
   const [username, setUsername] = useState<string | null>(null);

   const [scrolled, setScrolled] = useState(false);
   const [bellOpen, setBellOpen] = useState(false);
   const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
   const [copied, setCopied] = useState(false);
   const [playersOnline, setPlayersOnline] = useState(1204);

   const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

   const [indicator, setIndicator] = useState({
      left: 0,
      width: 0,
      visible: false,
   });

   const isAuthenticated = !!user;

   /*
   |--------------------------------------------------------------------------
   | Prevent background scrolling
   |--------------------------------------------------------------------------
   */

   useEffect(() => {
      const shouldLockScroll = menuOpen || !!authModal || showUsernameModal;

      if (shouldLockScroll) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = '';
      }

      return () => {
         document.body.style.overflow = '';
      };
   }, [menuOpen, authModal, showUsernameModal]);

   /*
   |--------------------------------------------------------------------------
   | Scroll state
   |--------------------------------------------------------------------------
   */

   useEffect(() => {
      const handleScroll = () => {
         setScrolled(window.scrollY > 12);
      };

      handleScroll();

      window.addEventListener('scroll', handleScroll, {
         passive: true,
      });

      return () => {
         window.removeEventListener('scroll', handleScroll);
      };
   }, []);

   /*
   |--------------------------------------------------------------------------
   | Players online
   |--------------------------------------------------------------------------
   */

   useEffect(() => {
      const interval = setInterval(() => {
         setPlayersOnline((current) =>
            Math.max(
               800,
               current + Math.round((Math.random() - 0.4) * 14)
            )
         );
      }, 3500);

      return () => clearInterval(interval);
   }, []);

   /*
   |--------------------------------------------------------------------------
   | Active navigation indicator
   |--------------------------------------------------------------------------
   */

   useLayoutEffect(() => {
      const activeIndex = navLinks.findIndex(
         (link) => link.href === pathname
      );

      const element = linkRefs.current[activeIndex];

      if (element) {
         setIndicator({
            left: element.offsetLeft,
            width: element.offsetWidth,
            visible: true,
         });
      } else {
         setIndicator((previous) => ({
            ...previous,
            visible: false,
         }));
      }
   }, [pathname]);

   /*
   |--------------------------------------------------------------------------
   | Fetch wallet username
   |--------------------------------------------------------------------------
   */

   // useEffect(() => {
   //    if (!address) {
   //       setUsername(null);
   //       return;
   //    }

   //    let mounted = true;

   //    getPlayer(address.toLowerCase()).then((player) => {
   //       if (mounted) {
   //          setUsername(player?.username ?? null);
   //       }
   //    });

   //    return () => {
   //       mounted = false;
   //    };
   // }, [address]);

   /*
   |--------------------------------------------------------------------------
   | Copy wallet address
   |--------------------------------------------------------------------------
   */

   const handleCopyAddress = async () => {
      if (!address) return;

      try {
         await navigator.clipboard.writeText(address);

         setCopied(true);

         setTimeout(() => {
            setCopied(false);
         }, 1500);
      } catch {
         // Ignore clipboard errors
      }
   };

   const handleLogout = async () => {
      try {
         await logout();

         setWalletDropdownOpen(false);
         setMenuOpen(false);
      } catch (error) {
         console.error('Logout failed:', error);
      }
   };

   const showAvatarButton =
      isConnected && address && !username;

   return (
      <>
         {/* NAVIGATION */}
         <nav
            className={`
               fixed
               inset-x-0
               top-0
               z-[100]
               flex
               h-[68px]
               items-center
               justify-between
               px-4
               transition-all
               duration-300
               md:px-8
               ${
                  scrolled
                     ? 'h-[58px]   bg-[#0a0a10]   '
                     : 'bg-transparent'
               }
            `}
         >
            {/* LOGO */}
            <Link
               href="/"
               className="flex shrink-0 items-center gap-3"
            >
               <div className="group flex items-center gap-3">
                  {/* <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-600 to-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.35)] transition duration-300 group-hover:scale-105 group-hover:-rotate-3 group-hover:shadow-[0_0_24px_rgba(168,85,247,0.55)]"> */}
                 <Image src="/nebula-logo-removebg-preview.png" alt="Logo" width={40} height={40} />
                  {/* </div> */}

                  <div className="hidden flex-col leading-[1.05] sm:flex">
                     <span className="text-[15px] font-bold tracking-[0.1em] text-white">
                        NEBULA
                     </span>

                     <span className="text-[11px] font-semibold tracking-[0.18em] text-[#a0a0b0]">
                        ENGINE
                     </span>
                  </div>
               </div>

               <span className="hidden items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/[0.06] px-2.5 py-1 text-[11.5px] font-semibold text-cyan-300 lg:flex">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />

                  {playersOnline.toLocaleString()} online
               </span>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <div className="relative hidden items-center gap-9 md:flex">
               <span
                  className="absolute -bottom-[13px] h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all duration-300"
                  style={{
                     left: indicator.left,
                     width: indicator.width,
                     opacity: indicator.visible ? 1 : 0,
                  }}
               />

               {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;

                  return (
                     <Link
                        key={link.href}
                        href={link.href}
                        ref={(element) => {
                           linkRefs.current[index] = element;
                        }}
                        className={`text-sm transition-colors ${
                           isActive
                              ? 'font-semibold text-purple-400'
                              : 'font-medium text-[#a0a0b0] hover:text-white'
                        }`}
                     >
                        {link.name}
                     </Link>
                  );
               })}
            </div>

            {/* DESKTOP RIGHT SIDE */}
            <div className="hidden items-center gap-3.5 md:flex">
               {!authLoading && !isAuthenticated ? (
                  <>
                     <button
                        onClick={() => setAuthModal('login')}
                        className="rounded-full border border-white/15 px-5 py-2 text-[13.5px] font-semibold text-[#e4e4f0] transition hover:bg-white/[0.05]"
                     >
                        Log in
                     </button>

                     <button
                        onClick={() => setAuthModal('signup')}
                        className="rounded-full bg-gradient-to-br from-violet-600 to-purple-500 px-[22px] py-2 text-[13.5px] font-semibold text-white shadow-[0_0_16px_rgba(168,85,247,0.35)] transition hover:-translate-y-px hover:shadow-[0_0_22px_rgba(168,85,247,0.55)]"
                     >
                        Sign up
                     </button>
                  </>
               ) : !authLoading && user ? (
                  <>
                  {/* Profile path  */}
                <Link
   href="/profile"
   aria-label="View profile"
   className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-white/60 transition-all duration-200 hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-400 hover:shadow-[0_0_18px_rgba(168,85,247,0.25)]"
>
   <CircleUser
      size={20}
      strokeWidth={1.8}
      className="transition-transform duration-200 group-hover:scale-110"
   />
</Link>
                     {/* BELL */}
                     <div
                        className="relative"
                        onMouseEnter={() => setBellOpen(true)}
                        onMouseLeave={() => setBellOpen(false)}
                     >
                        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.07]">
                           <Bell
                              size={16}
                              className="text-purple-400"
                           />

                           {ACTIVE_BOUNTIES.length > 0 && (
                              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#0a0a10] bg-red-500 px-1 text-[10px] font-bold text-white">
                                 {ACTIVE_BOUNTIES.length}
                              </span>
                           )}
                        </button>

                        {bellOpen && (
                           <div className="absolute right-0 top-[calc(100%+10px)] z-[200] w-[260px] rounded-xl border border-purple-500/30 bg-[#100e16]/95 p-2 shadow-2xl backdrop-blur-xl">
                              <div className="px-2 pb-2 pt-1 text-[11px] font-semibold tracking-wide text-[#8b8b9e]">
                                 ACTIVE BOUNTIES
                              </div>

                              {ACTIVE_BOUNTIES.map((bounty) => (
                                 <div
                                    key={bounty.id}
                                    className="flex items-center justify-between rounded-lg p-2 transition hover:bg-white/[0.04]"
                                 >
                                    <span className="text-xs text-[#e4e4f0]">
                                       {bounty.label}
                                    </span>

                                    <span className="text-xs font-bold text-cyan-300">
                                       {bounty.reward}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>

                     {/* WALLET */}
                     <div
                        className="relative"
                        onMouseEnter={() =>
                           isConnected &&
                           setWalletDropdownOpen(true)
                        }
                        onMouseLeave={() =>
                           setWalletDropdownOpen(false)
                        }
                     >
                        <ConnectButton
                           showBalance
                           chainStatus="icon"
                           accountStatus="avatar"
                        />

                        {walletDropdownOpen &&
                           isConnected &&
                           address && (
                              <div className="absolute right-0 top-[calc(100%+10px)] z-[200] w-[200px] rounded-xl border border-purple-500/30 bg-[#100e16]/95 p-1.5 shadow-2xl backdrop-blur-xl">
                                 <button
                                    onClick={handleCopyAddress}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] text-[#e4e4f0] transition hover:bg-white/[0.05]"
                                 >
                                    {copied ? (
                                       <Check
                                          size={14}
                                          className="text-cyan-400"
                                       />
                                    ) : (
                                       <Copy
                                          size={14}
                                          className="text-[#a0a0b0]"
                                       />
                                    )}

                                    {copied
                                       ? 'Copied!'
                                       : 'Copy address'}
                                 </button>

                                 <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] text-red-400 transition hover:bg-red-400/[0.08]"
                                 >
                                    <LogOut size={14} />

                                    Log out
                                 </button>

                                 <button
                                    onClick={() => disconnect()}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] text-red-400 transition hover:bg-red-400/[0.08]"
                                 >
                                    <LogOut size={14} />

                                    Disconnect wallet
                                 </button>
                              </div>
                           )}
                     </div>

                     {/* USERNAME */}
                     {showAvatarButton && (
                        <button
                           onClick={() =>
                              setShowUsernameModal(true)
                           }
                           className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 transition hover:border-purple-500/60 hover:bg-purple-500/25 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                        >
                           <User
                              size={16}
                              className="text-purple-400"
                           />
                        </button>
                     )}
                  </>
               ) : null}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
               onClick={() => setMenuOpen((open) => !open)}
               className="flex items-center justify-center p-1 text-white md:hidden"
            >
               {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
         </nav>

         {/* MOBILE BACKDROP */}
         {menuOpen && (
            <div
               onClick={() => setMenuOpen(false)}
               className="fixed inset-0 z-[98] bg-black/60 backdrop-blur-sm md:hidden"
            />
         )}

         {/* MOBILE DRAWER */}
         <aside
            className={`fixed right-0 top-0 z-[99] flex h-screen w-[280px] flex-col gap-2 overflow-y-auto border-l border-white/[0.08] bg-[#111114] px-7 pb-8 pt-20 transition-transform duration-300 md:hidden ${
               menuOpen
                  ? 'translate-x-0'
                  : 'translate-x-full'
            }`}
         >
            <div className="mb-4 flex w-fit items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/[0.06] px-2.5 py-1 text-[11.5px] font-semibold text-cyan-300">
               <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

               {playersOnline.toLocaleString()} online
            </div>

            {navLinks.map((link) => {
               const isActive = pathname === link.href;

               return (
                  <Link
                     key={link.href}
                     href={link.href}
                     onClick={() => setMenuOpen(false)}
                     className={`flex items-center justify-between border-b border-white/[0.05] py-3 text-base ${
                        isActive
                           ? 'font-semibold text-purple-400'
                           : 'font-medium text-[#a0a0b0]'
                     }`}
                  >
                     {link.name}

                     {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                     )}
                  </Link>
               );
            })}

            {!authLoading && !user && (
               <div className="mt-6 flex flex-col gap-2.5">
                  <button
                     onClick={() => {
                        setMenuOpen(false);
                        setAuthModal('login');
                     }}
                     className="rounded-full border border-white/15 py-2.5 text-sm font-semibold text-[#e4e4f0]"
                  >
                     Log in
                  </button>

                  <button
                     onClick={() => {
                        setMenuOpen(false);
                        setAuthModal('signup');
                     }}
                     className="rounded-full bg-gradient-to-br from-violet-600 to-purple-500 py-2.5 text-sm font-semibold text-white shadow-[0_0_16px_rgba(168,85,247,0.35)]"
                  >
                     Sign up
                  </button>
               </div>
            )}

            {!authLoading && user && (
               <div className="mt-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                     <ConnectButton
                        showBalance
                        chainStatus="none"
                        accountStatus="address"
                     />

                     {showAvatarButton && (
                        <button
                           onClick={() => {
                              setMenuOpen(false);
                              setShowUsernameModal(true);
                           }}
                           className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10"
                        >
                           <User
                              size={16}
                              className="text-purple-400"
                           />
                        </button>
                     )}
                  </div>

                  <button
                     onClick={handleLogout}
                     className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400"
                  >
                     <LogOut size={16} />
                     Log out
                  </button>
               </div>
            )}
         </aside>

         {/* AUTH MODAL */}
         {authModal && (
            <AuthModal
               mode={authModal}
               onClose={() => setAuthModal(null)}
               onModeChange={setAuthModal}
            />
         )}

         {/* USERNAME MODAL */}
         {showUsernameModal && address && (
            <UsernameModal
               address={address}
               onComplete={(newUsername) => {
                  setUsername(newUsername);
                  setShowUsernameModal(false);
               }}
               onClose={() => setShowUsernameModal(false)}
            />
         )}
      </>
   );
}