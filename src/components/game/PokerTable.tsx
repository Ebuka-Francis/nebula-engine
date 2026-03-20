'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GameState, GamePlayer } from '../../../types';
import { useAccount } from 'wagmi';
import { httpsCallable } from 'firebase/functions';
import { Functions } from 'firebase/functions';
import ActionPanel from './ActionPanel';
import PlayerHUD from './PlayerHUD';

interface Props {
  tournamentId: string;
}

export default function PokerTable({ tournamentId }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cardsRef = useRef<THREE.Mesh[]>([]);
  const animFrameRef = useRef<number>(0);

  const { address } = useAccount();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myHand, setMyHand] = useState<any[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);

  // ── Listen to game state ──
  useEffect(() => {
    if (!tournamentId) return;

    const unsubGame = onSnapshot(
      doc(db, 'gameState', tournamentId),
      (snap) => {
        if (snap.exists()) {
          const state = snap.data() as GameState;
          setGameState(state);
          setIsMyTurn(state.currentTurn === address?.toLowerCase());
        }
      }
    );

    // Listen to private hand (only your cards)
    const unsubHand = address
      ? onSnapshot(
          doc(db, 'gameState', tournamentId, 'privateHands', address.toLowerCase()),
          (snap) => {
            if (snap.exists()) setMyHand(snap.data()?.holeCards || []);
          }
        )
      : () => {};

    return () => {
      unsubGame();
      unsubHand();
    };
  }, [tournamentId, address]);

  // ── Three.js Scene ──
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0d0d0f');
    sceneRef.current = scene;

    // Camera — angled top-down view
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0x9333ea, 0.4);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 2);
    spotLight.position.set(0, 10, 0);
    spotLight.castShadow = true;
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.3;
    scene.add(spotLight);

    // Purple rim lights
    const rimLight1 = new THREE.PointLight(0x7c3aed, 1.5, 10);
    rimLight1.position.set(-5, 2, 0);
    scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0x22d3ee, 1, 10);
    rimLight2.position.set(5, 2, 0);
    scene.add(rimLight2);

    // ── Table ──
    // Table surface (oval using ellipse)
    const tableGeometry = new THREE.CylinderGeometry(4.5, 4.5, 0.15, 64);
    tableGeometry.scale(1, 1, 0.65); // squish to oval
    const tableMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a5c2a,     // poker green felt
      roughness: 0.9,
      metalness: 0.0,
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.receiveShadow = true;
    table.position.y = -0.1;
    scene.add(table);

    // Table edge (rail)
    const railGeometry = new THREE.TorusGeometry(4.5, 0.25, 16, 64);
    railGeometry.scale(1, 1, 0.65);
    const railMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d1a00,     // dark wood
      roughness: 0.6,
      metalness: 0.2,
    });
    const rail = new THREE.Mesh(railGeometry, railMaterial);
    rail.rotation.x = Math.PI / 2;
    rail.position.y = 0.05;
    scene.add(rail);

    // Felt lines
    const lineGeometry = new THREE.RingGeometry(1.5, 1.52, 64);
    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0x2d7a3a, side: THREE.DoubleSide });
    const feltLine = new THREE.Mesh(lineGeometry, lineMaterial);
    feltLine.rotation.x = -Math.PI / 2;
    feltLine.position.y = 0.01;
    scene.add(feltLine);

    // ── Community Card Placeholders ──
    for (let i = 0; i < 5; i++) {
      const cardGeo = new THREE.BoxGeometry(0.45, 0.01, 0.65);
      const cardMat = new THREE.MeshStandardMaterial({
        color: 0x1a3a20,
        roughness: 0.8,
        transparent: true,
        opacity: 0.5,
      });
      const placeholder = new THREE.Mesh(cardGeo, cardMat);
      placeholder.position.set(-1.8 + i * 0.55, 0.08, 0);
      scene.add(placeholder);
    }

    // ── Pot chip stack ──
    const chipGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 16);
    const chipMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
    for (let i = 0; i < 3; i++) {
      const chip = new THREE.Mesh(chipGeo, chipMat);
      chip.position.set(0, 0.06 + i * 0.05, -1);
      chip.castShadow = true;
      scene.add(chip);
    }

    // ── Nebula logo on felt (subtle) ──
    const logoGeo = new THREE.CircleGeometry(0.5, 32);
    const logoMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });
    const logo = new THREE.Mesh(logoGeo, logoMat);
    logo.rotation.x = -Math.PI / 2;
    logo.position.y = 0.02;
    scene.add(logo);

    // ── Player Seats ──
    const seatPositions = [
      { x: 0, z: -3.2 },      // bottom center (you)
      { x: -2.8, z: -1.8 },   // bottom left
      { x: -3.8, z: 0.2 },    // left
      { x: -2.8, z: 2.2 },    // top left
      { x: 0, z: 3.0 },       // top center
      { x: 2.8, z: 2.2 },     // top right
      { x: 3.8, z: 0.2 },     // right
      { x: 2.8, z: -1.8 },    // bottom right
    ];

    seatPositions.forEach((pos, i) => {
      const seatGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 32);
      const seatMat = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0x7c3aed : 0x2a2a3e,
        roughness: 0.5,
        metalness: 0.3,
        emissive: i === 0 ? 0x3b1a7a : 0x000000,
        emissiveIntensity: i === 0 ? 0.3 : 0,
      });
      const seat = new THREE.Mesh(seatGeo, seatMat);
      seat.position.set(pos.x, 0.04, pos.z);
      seat.castShadow = true;
      scene.add(seat);
    });

    // ── Dealer button ──
    const dealerGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16);
    const dealerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xaaaaaa,
      emissiveIntensity: 0.3,
    });
    const dealerBtn = new THREE.Mesh(dealerGeo, dealerMat);
    dealerBtn.position.set(0.5, 0.05, -2.8);
    scene.add(dealerBtn);

    // ── Animation loop ──
    let time = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Subtle rim light animation
      rimLight1.intensity = 1.5 + Math.sin(time) * 0.3;
      rimLight2.intensity = 1.0 + Math.cos(time * 0.7) * 0.2;

      // Gentle camera sway
      camera.position.x = Math.sin(time * 0.1) * 0.15;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize handler ──
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // ── Update community cards in 3D when game state changes ──
  useEffect(() => {
    if (!sceneRef.current || !gameState) return;
    // Cards update logic would go here
    // For now community cards are shown in the HUD overlay
  }, [gameState]);

  return (
    <div className="relative w-full h-screen bg-[#0d0d0f] overflow-hidden">

      {/* Three.js canvas */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* HUD Overlay */}
      {gameState && (
        <>
          {/* Community Cards */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 pointer-events-none">
            {gameState.communityCards.map((card, i) => (
              <CardUI key={i} card={card} revealed />
            ))}
            {/* Placeholders for undealt cards */}
            {Array.from({ length: 5 - gameState.communityCards.length }).map((_, i) => (
              <CardUI key={`placeholder-${i}`} card={null} revealed={false} />
            ))}
          </div>

          {/* Pot */}
          <div className="absolute top-[42%] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <span className="text-yellow-400 font-black text-lg">
              {gameState.pot.toLocaleString()} USDC
            </span>
            <span className="text-white/30 text-[10px] uppercase tracking-widest">Pot</span>
          </div>

          {/* Phase Badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1.5 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold uppercase tracking-widest">
              {gameState.phase}
            </span>
          </div>

          {/* Player seats HUD */}
          {Object.values(gameState.players).map((player) => (
            <PlayerHUD
              key={player.address}
              player={player}
              isCurrentTurn={gameState.currentTurn === player.address}
              isMe={player.address === address?.toLowerCase()}
              turnDeadline={gameState.turnDeadline}
            />
          ))}

          {/* My hole cards */}
          {myHand.length > 0 && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-3">
              {myHand.map((card, i) => (
                <CardUI key={i} card={card} revealed />
              ))}
            </div>
          )}

          {/* Winners announcement */}
          {gameState.phase === 'showdown' && gameState.winners && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/80 backdrop-blur-sm border border-yellow-400/30 rounded-2xl px-8 py-6 text-center">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-yellow-400 font-black text-xl">Winner!</p>
                {gameState.winners.map((w) => (
                  <div key={w.address}>
                    <p className="text-white font-mono text-sm">{w.address.slice(0, 6)}...{w.address.slice(-4)}</p>
                    <p className="text-yellow-300 font-bold">{w.hand}</p>
                    <p className="text-emerald-400 font-black text-lg">+{w.amount.toLocaleString()} USDC</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Action Panel */}
      {isMyTurn && gameState && (
        <ActionPanel
          tournamentId={tournamentId}
          gameState={gameState}
          playerAddress={address?.toLowerCase() ?? ''}
        />
      )}
    </div>
  );
}

// ── Card UI Component ─────────────────────────────────────
function CardUI({ card, revealed }: { card: any; revealed: boolean }) {
  const suitSymbol: Record<string, string> = {
    spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣'
  };
  const suitColor: Record<string, string> = {
    spades: 'text-white', hearts: 'text-red-500',
    diamonds: 'text-red-500', clubs: 'text-white'
  };

  return (
    <div className={`w-12 h-16 rounded-lg border flex items-center justify-center font-black text-sm transition-all duration-300 ${
      revealed && card
        ? 'bg-white border-white/20 shadow-lg'
        : 'bg-[#1a1a2e] border-purple-500/20'
    }`}>
      {revealed && card ? (
        <div className={`flex flex-col items-center leading-none ${suitColor[card.suit]}`}>
          <span className="text-xs">{card.rank}</span>
          <span>{suitSymbol[card.suit]}</span>
        </div>
      ) : (
        <span className="text-purple-400/40 text-lg">🂠</span>
      )}
    </div>
  );
}