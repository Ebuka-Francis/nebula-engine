import { Howl } from 'howler';

// Define the sounds
const sounds: Record<string, Howl> = {
   shuffle: new Howl({ src: ['/sounds/shuffle.mp3'], volume: 0.5 }),
   yourTurn: new Howl({ src: ['/sounds/ding.mp3'], volume: 0.7 }),
   winner: new Howl({ src: ['/sounds/winner.mp3'], volume: 0.8 }),
   fold: new Howl({ src: ['/sounds/fold.mp3'], volume: 0.4 }),
   // NEW SOUNDS
   chips: new Howl({ src: ['/sounds/chips.mp3'], volume: 0.6 }),
   cardFlip: new Howl({ src: ['/sounds/card-flip.mp3'], volume: 0.5 }),
   raise: new Howl({ src: ['/sounds/raise.mp3'], volume: 0.6 }),
};

export const playSound = (name: keyof typeof sounds) => {
   // Check if user has globally muted sounds
   const isMuted = localStorage.getItem('pokerMute') === 'true';
   if (!isMuted && sounds[name]) {
      sounds[name].play();
   }
};

export const setGlobalMute = (mute: boolean) => {
   localStorage.setItem('pokerMute', mute.toString());
   // Howler can also mute everything globally in one go
   Howler.mute(mute);
};
