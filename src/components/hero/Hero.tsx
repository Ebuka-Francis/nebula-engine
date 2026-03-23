'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HeroSection() {
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animId: number;

      const resize = () => {
         canvas.width = canvas.offsetWidth;
         canvas.height = canvas.offsetHeight;
      };
      resize();
      window.addEventListener('resize', resize);

      // Particles
      const PARTICLE_COUNT = 120;
      const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
         x: Math.random() * canvas.width,
         y: Math.random() * canvas.height,
         r: Math.random() * 1.5 + 0.3,
         speedX: (Math.random() - 0.5) * 0.3,
         speedY: (Math.random() - 0.5) * 0.3,
         opacity: Math.random() * 0.6 + 0.2,
         color: Math.random() > 0.5 ? '#a855f7' : '#22d3ee',
      }));

      const draw = () => {
         ctx.clearRect(0, 0, canvas.width, canvas.height);

         particles.forEach((p) => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
         });

         // Draw connecting lines between nearby particles
         for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
               const dx = particles[i].x - particles[j].x;
               const dy = particles[i].y - particles[j].y;
               const dist = Math.sqrt(dx * dx + dy * dy);
               if (dist < 90) {
                  ctx.beginPath();
                  ctx.moveTo(particles[i].x, particles[i].y);
                  ctx.lineTo(particles[j].x, particles[j].y);
                  ctx.strokeStyle = '#a855f7';
                  ctx.globalAlpha = (1 - dist / 90) * 0.12;
                  ctx.lineWidth = 0.6;
                  ctx.stroke();
                  ctx.globalAlpha = 1;
               }
            }
         }

         animId = requestAnimationFrame(draw);
      };

      draw();

      return () => {
         cancelAnimationFrame(animId);
         window.removeEventListener('resize', resize);
      };
   }, []);

   return (
      <section
         className="hero-section"
         style={{
            position: 'relative',
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: '#0d0d0f',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 24px 40px',
            fontFamily: "'Sora', 'DM Sans', sans-serif",
            textAlign: 'center',
            overflow: 'hidden',
         }}
      >
         {/* Canvas particle background */}
         <canvas
            ref={canvasRef}
            style={{
               position: 'absolute',
               inset: 0,
               width: '100%',
               height: '100%',
               zIndex: 0,
            }}
         />

         {/* Animated glowing orbs */}
         <div
            style={{
               position: 'absolute',
               inset: 0,
               zIndex: 0,
               overflow: 'hidden',
            }}
         >
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
         </div>

         {/* Content */}
         <div
            style={{
               position: 'relative',
               zIndex: 1,
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
            }}
         >
            {/* Badge */}
            <div
               className="hero-badge"
               style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  border: '1px solid rgba(168, 85, 247, 0.45)',
                  backgroundColor: 'rgba(168, 85, 247, 0.08)',
                  color: '#c084fc',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  marginBottom: '28px',
                  letterSpacing: '0.02em',
                  backdropFilter: 'blur(6px)',
               }}
            >
               <span
                  style={{
                     width: '7px',
                     height: '7px',
                     borderRadius: '50%',
                     backgroundColor: '#a855f7',
                     boxShadow: '0 0 8px #a855f7',
                     display: 'inline-block',
                     animation: 'pulse 2s ease-in-out infinite',
                  }}
               />
               Powered by Rain Protocol
            </div>

            {/* Headline */}
            <h1
               className="hero-title"
               style={{
                  margin: '0 0 20px',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
               }}
            >
               <span
                  style={{
                     display: 'block',
                     fontSize: 'clamp(42px, 7vw, 82px)',
                     fontWeight: 800,
                     background:
                        'linear-gradient(90deg, #a855f7 0%, #7c3aed 40%, #22d3ee 100%)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     backgroundClip: 'text',
                  }}
               >
                  Decentralized
               </span>
               <span
                  style={{
                     display: 'block',
                     fontSize: 'clamp(42px, 7vw, 82px)',
                     fontWeight: 800,
                     color: '#ffffff',
                  }}
               >
                  Tournament Engine
               </span>
            </h1>

            {/* Subtext */}
            <p
               className="hero-subtitle"
               style={{
                  margin: '0 0 36px',
                  color: '#8b8b9e',
                  fontSize: 'clamp(14px, 1.8vw, 16.5px)',
                  maxWidth: '480px',
                  lineHeight: 1.7,
                  fontWeight: 400,
               }}
            >
               Launch tokenized, trustless poker tournaments. Automated staking,
               escrow, and payouts — no code needed.
            </p>

            {/* CTA Buttons */}
            <div
               className="hero-buttons"
               style={{
                  display: 'flex',
                  gap: '14px',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  marginBottom: '56px',
               }}
            >
               <Link
                  href={'/tournament'}
                  style={{
                     padding: '12px 28px',
                     background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                     border: 'none',
                     borderRadius: '10px',
                     color: '#fff',
                     fontSize: '15px',
                     fontWeight: 600,
                     cursor: 'pointer',
                     boxShadow: '0 0 24px rgba(139, 92, 246, 0.4)',
                     transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                     e.currentTarget.style.opacity = '0.85';
                     e.currentTarget.style.boxShadow =
                        '0 0 36px rgba(139, 92, 246, 0.65)';
                  }}
                  onMouseLeave={(e) => {
                     e.currentTarget.style.opacity = '1';
                     e.currentTarget.style.boxShadow =
                        '0 0 24px rgba(139, 92, 246, 0.4)';
                  }}
               >
                  Launch Tournament →
               </Link>

               <Link
                  href={'/tournament'}
                  style={{
                     padding: '12px 28px',
                     background: 'transparent',
                     border: '1px solid rgba(168, 85, 247, 0.5)',
                     borderRadius: '10px',
                     color: '#c084fc',
                     fontSize: '15px',
                     fontWeight: 600,
                     cursor: 'pointer',
                     backdropFilter: 'blur(6px)',
                     transition: 'border-color 0.2s ease, color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                     e.currentTarget.style.borderColor = '#a855f7';
                     e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                     e.currentTarget.style.borderColor =
                        'rgba(168, 85, 247, 0.5)';
                     e.currentTarget.style.color = '#c084fc';
                  }}
               >
                  Browse Tournaments
               </Link>
            </div>

            {/* Stats */}
            <div
               className="hero-stats"
               style={{
                  display: 'flex',
                  gap: 'clamp(32px, 8vw, 80px)',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
               }}
            >
               {[
                  { value: '10K+', label: 'Tournaments' },
                  { value: '$2.5M', label: 'Total Staked' },
                  { value: '50K+', label: 'Players' },
               ].map((stat) => (
                  <div
                     key={stat.label}
                     style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                     }}
                  >
                     <span
                        style={{
                           fontSize: 'clamp(26px, 4vw, 36px)',
                           fontWeight: 700,
                           background:
                              'linear-gradient(90deg, #a855f7, #22d3ee)',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                           backgroundClip: 'text',
                        }}
                     >
                        {stat.value}
                     </span>
                     <span
                        style={{
                           color: '#6b6b80',
                           fontSize: '13px',
                           fontWeight: 500,
                           letterSpacing: '0.03em',
                        }}
                     >
                        {stat.label}
                     </span>
                  </div>
               ))}
            </div>
         </div>

         <style>{`
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 10s ease-in-out infinite;
        }
        .orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.3), transparent 70%);
          top: -100px;
          left: -100px;
          animation-duration: 12s;
        }
        .orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(34, 211, 238, 0.2), transparent 70%);
          bottom: -80px;
          right: -80px;
          animation-duration: 9s;
          animation-delay: -3s;
        }
        .orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent 70%);
          top: 40%;
          left: 55%;
          animation-duration: 14s;
          animation-delay: -6s;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #a855f7; }
          50% { opacity: 0.5; box-shadow: 0 0 16px #a855f7; }
        }
        @media (max-width: 768px) {
          .hero-section { padding: 36px 20px 32px !important; }
          .hero-title span { font-size: 38px !important; }
          .hero-subtitle { font-size: 14px !important; margin-bottom: 28px !important; }
          .hero-buttons { flex-direction: column !important; width: 100% !important; max-width: 320px !important; margin-bottom: 40px !important; }
          .hero-buttons button { width: 100% !important; }
          .hero-stats { gap: 28px !important; }
          .orb-1 { width: 280px; height: 280px; }
          .orb-2 { width: 220px; height: 220px; }
          .orb-3 { display: none; }
        }
      `}</style>
      </section>
   );
}
