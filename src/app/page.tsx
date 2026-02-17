'use client';

import { useState, useEffect } from 'react';

const images = [
  'https://i.postimg.cc/NjMVBm49/chad1.png',
  'https://i.postimg.cc/dV1XwrBL/chad2.png',
  'https://i.postimg.cc/dV1XwrBd/chad3.png',
];
const finalImage = 'https://i.postimg.cc/7Z0zCQmy/chadjoin.png';
const WHATSAPP_LINK = 'https://chat.whatsapp.com/CSWvtoK3lmY1Wlye06FcjK';

export default function Home() {
  const [index, setIndex] = useState(0);
  const [isFinal, setIsFinal] = useState(false);
  const [opacity, setOpacity] = useState(true);

  useEffect(() => {
    if (index < images.length) {
      const timer = setTimeout(() => {
        setOpacity(false);
        
        setTimeout(() => {
          setIndex((prev) => prev + 1);
          setOpacity(true);
        }, 150); 
      }, 800); 
      return () => clearTimeout(timer);
    } else {
      setIsFinal(true);
    }
  }, [index]);

  const currentSrc = isFinal ? finalImage : images[index];

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      {/* Si es la imagen final, envolvemos todo en el link de WhatsApp */}
      {isFinal ? (
        <a 
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 w-full h-full block cursor-pointer animate-in fade-in duration-500"
        >
          <img
            src={currentSrc}
            alt="Join Sempi"
            className="w-full h-full object-cover"
          />
          {/* Opcional: un overlay sutil para indicar que es clickable */}
          <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors" />
        </a>
      ) : (
        /* Imágenes de intro normales */
        <div 
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ease-in-out ${
            opacity ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={currentSrc}
            alt="Intro"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </main>
  );
}