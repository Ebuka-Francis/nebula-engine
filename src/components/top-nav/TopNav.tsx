'use client';

import { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import UsernameModal from '../modals/UsernameModal';
import { getPlayer } from '@/lib/playerService'; // make sure this exists

export default function TopNav() {
   const [menuOpen, setMenuOpen] = useState(false);
   const [showUsernameModal, setShowUsernameModal] = useState(false);
   const [username, setUsername] = useState<string | null>(null);
   const pathname = usePathname();
   const { address, isConnected } = useAccount();

   // Fetch username when wallet connects
   useEffect(() => {
      if (!address) {
         setUsername(null);
         return;
      }
      getPlayer(address.toLowerCase()).then((player) => {
         setUsername(player?.username ?? null);
      });
   }, [address]);

   const navLinks = [
      { name: 'Tournaments', href: '/tournament' },
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Leaderboard', href: '/leaderboard' },
   ];

   // show button if connected but no username yet
   const showAvatarButton = isConnected && address && !username;

   return (
      <>
         <nav
            style={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               padding: '0 32px',
               height: '64px',
               backgroundColor: '#0d0d0f',
               borderBottom: '1px solid rgba(255,255,255,0.06)',
               fontFamily: "'Sora', 'DM Sans', sans-serif",
               position: 'relative',
               zIndex: 100,
            }}
         >
            {/* Logo */}
            <Link
               href="/"
               style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  textDecoration: 'none',
               }}
            >
               <div
                  style={{
                     width: '36px',
                     height: '36px',
                     borderRadius: '10px',
                     background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontWeight: 700,
                     fontSize: '16px',
                     color: '#fff',
                  }}
               >
                  N
               </div>
               <span
                  style={{
                     color: '#ffffff',
                     fontWeight: 700,
                     fontSize: '17px',
                     letterSpacing: '0.08em',
                  }}
               >
                  NEBULA
               </span>
            </Link>

            {/* Desktop Nav Links */}
            <div
               className="desktop-nav"
               style={{ display: 'flex', alignItems: 'center', gap: '40px' }}
            >
               {navLinks.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                     <Link
                        key={item.name}
                        href={item.href}
                        style={{
                           color: isActive ? '#a855f7' : '#a0a0b0',
                           textDecoration: 'none',
                           fontSize: '14.5px',
                           fontWeight: isActive ? 600 : 500,
                           letterSpacing: '0.01em',
                           transition: 'color 0.2s ease',
                           position: 'relative',
                        }}
                        onMouseEnter={(e) =>
                           ((e.target as HTMLAnchorElement).style.color =
                              '#ffffff')
                        }
                        onMouseLeave={(e) =>
                           ((e.target as HTMLAnchorElement).style.color =
                              isActive ? '#a855f7' : '#a0a0b0')
                        }
                     >
                        {item.name}
                        {isActive && (
                           <span
                              style={{
                                 position: 'absolute',
                                 bottom: '-4px',
                                 left: '50%',
                                 transform: 'translateX(-50%)',
                                 width: '4px',
                                 height: '4px',
                                 borderRadius: '50%',
                                 backgroundColor: '#a855f7',
                                 boxShadow: '0 0 6px #a855f7',
                              }}
                           />
                        )}
                     </Link>
                  );
               })}
            </div>

            {/* Desktop Right Side — Connect Button + Avatar */}
            <div
               className="desktop-nav"
               style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            >
               <ConnectButton
                  showBalance={true}
                  chainStatus="icon"
                  accountStatus="avatar"
               />

               {/* Only show if connected and no username yet */}
               {showAvatarButton && (
                  <button
                     onClick={() => setShowUsernameModal(true)}
                     title="Set Username"
                     style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background:
                           'linear-gradient(135deg, #7c3aed22, #a855f722)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                     }}
                     onMouseEnter={(e) => {
                        (
                           e.currentTarget as HTMLButtonElement
                        ).style.background =
                           'linear-gradient(135deg, #7c3aed44, #a855f744)';
                        (
                           e.currentTarget as HTMLButtonElement
                        ).style.borderColor = 'rgba(168, 85, 247, 0.6)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                           '0 0 12px rgba(168, 85, 247, 0.3)';
                     }}
                     onMouseLeave={(e) => {
                        (
                           e.currentTarget as HTMLButtonElement
                        ).style.background =
                           'linear-gradient(135deg, #7c3aed22, #a855f722)';
                        (
                           e.currentTarget as HTMLButtonElement
                        ).style.borderColor = 'rgba(168, 85, 247, 0.3)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                           'none';
                     }}
                  >
                     <User size={16} color="#a855f7" />
                  </button>
               )}
            </div>

            {/* Hamburger (mobile only) */}
            <button
               className="mobile-nav"
               onClick={() => setMenuOpen(!menuOpen)}
               style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
               }}
            >
               {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
         </nav>

         {/* Backdrop */}
         {menuOpen && (
            <div
               onClick={() => setMenuOpen(false)}
               style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  zIndex: 98,
                  backdropFilter: 'blur(2px)',
               }}
            />
         )}

         {/* Mobile Drawer */}
         <div
            style={{
               position: 'fixed',
               top: 0,
               right: 0,
               height: '100vh',
               width: '260px',
               backgroundColor: '#111114',
               borderLeft: '1px solid rgba(255,255,255,0.08)',
               zIndex: 99,
               padding: '80px 28px 32px',
               display: 'flex',
               flexDirection: 'column',
               gap: '8px',
               transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
               transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
               fontFamily: "'Sora', 'DM Sans', sans-serif",
            }}
         >
            {navLinks.map((item) => {
               const isActive = pathname === item.href;
               return (
                  <Link
                     key={item.href}
                     href={item.href}
                     onClick={() => setMenuOpen(false)}
                     style={{
                        color: isActive ? '#a855f7' : '#a0a0b0',
                        textDecoration: 'none',
                        fontSize: '16px',
                        fontWeight: isActive ? 600 : 500,
                        padding: '12px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'color 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                     }}
                  >
                     {item.name}
                     {isActive && (
                        <span
                           style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#a855f7',
                              boxShadow: '0 0 8px #a855f7',
                           }}
                        />
                     )}
                  </Link>
               );
            })}

            {/* Connect Wallet + Avatar in drawer */}
            <div
               style={{
                  marginTop: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
               }}
            >
               <ConnectButton
                  showBalance={true}
                  chainStatus="none"
                  accountStatus="address"
               />

               {/* Only show if connected and no username yet */}
               {showAvatarButton && (
                  <button
                     onClick={() => {
                        setMenuOpen(false);
                        setShowUsernameModal(true);
                     }}
                     title="Set Username"
                     style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background:
                           'linear-gradient(135deg, #7c3aed22, #a855f722)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                     }}
                  >
                     <User size={16} color="#a855f7" />
                  </button>
               )}
            </div>
         </div>

         {/* Username Modal */}
         {showUsernameModal && address && (
            <UsernameModal
               address={address}
               onComplete={(newUsername) => {
                  setUsername(newUsername); // ← hides button immediately after setting
                  setShowUsernameModal(false);
               }}
               onClose={() => setShowUsernameModal(false)}
            />
         )}

         <style>{`
            @media (max-width: 768px) {
               .desktop-nav { display: none !important; }
               .mobile-nav { display: flex !important; }
            }
            @media (min-width: 769px) {
               .mobile-nav { display: none !important; }
            }
         `}</style>
      </>
   );
}
