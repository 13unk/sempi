'use client';

import { useState, useEffect } from 'react';

const images = [
  'https://i.postimg.cc/NjMVBm49/chad1.png',
  'https://i.postimg.cc/dV1XwrBL/chad2.png',
  'https://i.postimg.cc/dV1XwrBd/chad3.png',
];
const finalImage = 'https://i.postimg.cc/7Z0zCQmy/chadjoin.png';
const WHATSAPP_LINK = 'https://chat.whatsapp.com/CSWvtoK3lmY1Wlye06FcjK';
const FAVICON_URL = 'https://i.postimg.cc/JhzS1nwy/icon.png';

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

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Título y Favicon */}
      <title>SEMPI</title>
      <link rel="icon" href={FAVICON_URL} />

      {/* Animación de parpadeo ajustada a 0.8s */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blink-bruto {
          0% { visibility: visible; }
          50% { visibility: hidden; }
          100% { visibility: visible; }
        }
        .text-cutre-blink {
          animation: blink-bruto 0.8s steps(1) infinite;
        }
      `}} />

      {!isFinal ? (
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ease-in-out ${opacity ? 'opacity-100' : 'opacity-0'}`}>
          <img src={images[index]} alt="Intro" className="w-full h-full object-cover" />
        </div>
      ) : (
        <a 
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 w-full h-full flex flex-col items-center justify-center cursor-pointer"
        >
          <img src={finalImage} alt="Join" className="absolute inset-0 w-full h-full object-cover z-0" />
          
          <div className="relative z-20 px-4 flex flex-col items-center">
            <h1 
              className="text-cutre-blink"
              style={{ 
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                color: '#00FF00',
                fontSize: 'clamp(1.5rem, 8vw, 4.5rem)',
                textDecoration: 'underline',
                fontWeight: '900',
                textAlign: 'center',
                lineHeight: '1.2',
                letterSpacing: '0.3em',
                /* Glow puro sin sombra negra */
                filter: 'drop-shadow(0 0 10px #00FF00) drop-shadow(0 0 20px #00FF00)',
              }}
            >
              ¡¡ ÚNETE A SEMPI AHORA, <br /> CLICK YA !!
            </h1>
          </div>
        </a>
      )}
    </main>
  );
}