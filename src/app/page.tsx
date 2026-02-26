"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// 14 painting images
const PAINTING_IMAGES = [
  "/cuadro1.png", "/cuadro2.png", "/cuadro3.png", "/cuadro4.png",
  "/cuadro5.png", "/cuadro6.png", "/cuadro7.png", "/cuadro8.png",
  "/cuadro9.png", "/cuadro10.png", "/cuadro11.png", "/cuadro12.png",
  "/cuadro13.png", "/cuadro14.png",
];

// Shuffle and assign images randomly to 20 rows (left + right), with cursed rotations
function shuffleImages(): {
  left: string;
  right: string;
  leftRot: number;
  rightRot: number;
}[] {
  // Create a pool of 40 images
  const pool: string[] = [];
  while (pool.length < 40) {
    pool.push(...PAINTING_IMAGES);
  }
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const rows: {
    left: string;
    right: string;
    leftRot: number;
    rightRot: number;
  }[] = [];
  for (let i = 0; i < 20; i++) {
    rows.push({
      left: pool[i * 2],
      right: pool[i * 2 + 1],
      leftRot: (Math.random() - 0.5) * 4, // -2 to +2 degrees
      rightRot: (Math.random() - 0.5) * 4,
    });
  }
  return rows;
}

const PAINTING_ROWS = shuffleImages();

const TOTAL_ROWS = PAINTING_ROWS.length;
const ROW_DEPTH = 500;
const LOOP_LENGTH = TOTAL_ROWS * ROW_DEPTH;
const SPEED = 55; // px/s

// 3 copies of the corridor so we can start in the middle copy
// and always have paintings visible ahead and behind
const COPIES = 3;
const CORRIDOR_LENGTH = LOOP_LENGTH * COPIES;

const CORRIDOR_WIDTH = 800;
const CORRIDOR_HEIGHT = 500;
const PAINTING_SIZE = 240;
const FRAME_WIDTH = 4;
const FRAMED_SIZE = PAINTING_SIZE + FRAME_WIDTH * 2;
const HORIZON_DEPTH = 3000; // How far the Gigachad is

// Sphere constants
const SPHERE_RADIUS = 22; // px visual size on screen
const SPHERE_CIRCUMFERENCE = 2 * Math.PI * SPHERE_RADIUS;

function Painting({
  src,
  posX,
  posY,
  rot,
}: {
  src: string;
  posX: number;
  posY: number;
  rot: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${posX - FRAMED_SIZE / 2}px`,
        top: `${posY - FRAMED_SIZE / 2 - 15}px`,
        transform: `rotate(${rot}deg)`,
      }}
    >
      <div
        style={{
          width: `${FRAMED_SIZE}px`,
          height: `${FRAMED_SIZE}px`,
          background: "linear-gradient(135deg, #c9a84c, #8a6914, #c9a84c)",
          borderRadius: "2px",
          padding: `${FRAME_WIDTH}px`,
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <img
          src={src}
          alt=""
          style={{
            width: `${PAINTING_SIZE}px`,
            height: `${PAINTING_SIZE}px`,
            objectFit: "cover",
            borderRadius: "1px",
            display: "block",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: "-20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "40px",
          height: "60px",
          background:
            "radial-gradient(ellipse, rgba(255,255,230,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default function Home() {
  const [cameraZ, setCameraZ] = useState(0);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const totalDistRef = useRef(0);
  const [sphereRotation, setSphereRotation] = useState(0);
  const initializedRef = useRef(false);
  const speedMultiplierRef = useRef(1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Wait for everything to mount, then fade in
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Scrolling disabled per user request
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  const animate = useCallback((now: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = now;
    }
    const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;

    // Gradually decay speed multiplier back toward 1
    speedMultiplierRef.current += (1 - speedMultiplierRef.current) * 0.02;

    const advance = (SPEED * speedMultiplierRef.current * delta) / 1000;
    totalDistRef.current += advance;

    // Sphere rotation in degrees based on distance traveled
    const rotDeg = (totalDistRef.current / SPHERE_CIRCUMFERENCE) * 360;
    setSphereRotation(rotDeg);

    setCameraZ((prev) => {
      const next = prev + advance;
      // Wrap around seamlessly when one full loop is passed
      return next >= LOOP_LENGTH ? next - LOOP_LENGTH : next;
    });

    // Dynamic FOV warp (estiramiento en los bordes)
    if (wrapperRef.current) {
      // Normal speed (1x) = 800px perspective
      // Max speed (5x) = 700px perspective (subtle stretch effect)
      const p = Math.max(700, 800 - (speedMultiplierRef.current - 1) * 25);
      wrapperRef.current.style.perspective = `${p}px`;
    }

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      // Start at a random position mid-corridor
      const randomStart = Math.floor(Math.random() * TOTAL_ROWS) * ROW_DEPTH;
      setCameraZ(randomStart);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate]);

  const allPaintings: {
    leftSrc: string;
    rightSrc: string;
    leftRot: number;
    rightRot: number;
    depth: number;
  }[] = [];

  for (let copy = 0; copy < COPIES; copy++) {
    for (let i = 0; i < TOTAL_ROWS; i++) {
      allPaintings.push({
        leftSrc: PAINTING_ROWS[i].left,
        rightSrc: PAINTING_ROWS[i].right,
        leftRot: PAINTING_ROWS[i].leftRot,
        rightRot: PAINTING_ROWS[i].rightRot,
        depth: copy * LOOP_LENGTH + i * ROW_DEPTH + ROW_DEPTH / 2,
      });
    }
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "800px",
        perspectiveOrigin: "50% 50%",
        overflow: "hidden",
        position: "relative",
        opacity: ready ? 1 : 0,
        transition: "opacity 0.8s ease-in",
      }}
    >
      {/* 3D corridor scene */}
      <div className="mobile-scaler" style={{ transformStyle: "preserve-3d" }}>
        <style>{`
          /* Escalar el escenario en pantallas verticales sin deformar los cuadros */
          @media (max-aspect-ratio: 1/1) {
            .mobile-scaler {
              transform: scale(0.7) !important;
            }
          }
        `}</style>
        <div
          className="corridor-scene"
          style={{
            transformStyle: "preserve-3d",
            transform: `translateZ(${cameraZ}px)`,
            position: "relative",
            width: 0,
            height: 0,
          }}
        >
          {/* --- TOP RIBBON --- */}
          <div
            style={{
              position: "absolute",
              width: `${CORRIDOR_WIDTH * 1.5}px`,
              height: `${CORRIDOR_LENGTH}px`,
              backgroundImage: `
                linear-gradient(90deg, #001a00 0%, rgba(15,125,9,0.95) 20%, rgba(31,250,19,1) 50%, rgba(15,125,9,0.95) 80%, #001a00 100%),
                repeating-linear-gradient(0deg, rgba(0,0,0,0.9) 0px, rgba(255,255,255,0.08) 200px, rgba(0,0,0,0.9) 400px)
              `,
              backgroundBlendMode: "overlay",
              transform: `rotateX(-90deg) translateZ(-${CORRIDOR_HEIGHT / 2}px)`,
              transformOrigin: "center center",
              left: `-${(CORRIDOR_WIDTH * 1.5) / 2}px`,
              top: `-${CORRIDOR_LENGTH}px`,
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            }}
          >
            {allPaintings.map((p, i) => (
              <div
                key={`light-${i}`}
                style={{
                  position: "absolute",
                  width: "100px",
                  height: "16px",
                  background: "rgba(255,255,240,0.7)",
                  borderRadius: "8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  top: `${p.depth - 8}px`,
                  boxShadow: "0 0 40px 15px rgba(255,255,220,0.15)",
                }}
              />
            ))}
          </div>

          {/* --- BOTTOM RIBBON --- */}
          <div
            style={{
              position: "absolute",
              width: `${CORRIDOR_WIDTH * 1.5}px`,
              height: `${CORRIDOR_LENGTH}px`,
              backgroundColor: "#001a00",
              backgroundImage: `
                linear-gradient(90deg, #001a00 0%, rgba(15,125,9,0.9) 20%, rgba(31,250,19,1) 50%, rgba(15,125,9,0.9) 80%, #001a00 100%),
                repeating-linear-gradient(0deg, rgba(0,0,0,0.9) 0px, rgba(255,255,255,0.08) 200px, rgba(0,0,0,0.9) 400px)
              `,
              backgroundBlendMode: "overlay",
              transform: `rotateX(90deg) translateZ(${CORRIDOR_HEIGHT / 2}px)`,
              transformOrigin: "center center",
              left: `-${(CORRIDOR_WIDTH * 1.5) / 2}px`,
              top: `-${CORRIDOR_LENGTH}px`,
              boxShadow: "0 -20px 50px rgba(0,0,0,0.8)",
            }}
          />

          {/* --- LEFT RIBBON --- */}
          <div
            style={{
              position: "absolute",
              width: `${CORRIDOR_LENGTH}px`,
              height: `${CORRIDOR_HEIGHT * 0.6}px`,
              backgroundImage: `
                linear-gradient(180deg, #001a00 0%, rgba(15,125,9,0.95) 20%, rgba(31,250,19,1) 50%, rgba(15,125,9,0.95) 80%, #001a00 100%),
                repeating-linear-gradient(90deg, rgba(0,0,0,0.9) 0px, rgba(255,255,255,0.08) 200px, rgba(0,0,0,0.9) 400px)
              `,
              backgroundBlendMode: "overlay",
              transform: `rotateY(90deg) translateZ(-${CORRIDOR_WIDTH / 2}px)`,
              transformOrigin: "center center",
              left: `-${CORRIDOR_LENGTH / 2}px`,
              top: `-${(CORRIDOR_HEIGHT * 0.6) / 2}px`,
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            }}
          >
            {allPaintings.map((p, i) => (
              <Painting
                key={`left-${i}`}
                src={p.leftSrc}
                posX={p.depth}
                posY={(CORRIDOR_HEIGHT * 0.6) / 2}
                rot={p.leftRot}
              />
            ))}
          </div>

          {/* --- RIGHT RIBBON --- */}
          <div
            style={{
              position: "absolute",
              width: `${CORRIDOR_LENGTH}px`,
              height: `${CORRIDOR_HEIGHT * 0.6}px`,
              backgroundImage: `
                linear-gradient(180deg, #001a00 0%, rgba(15,125,9,0.95) 20%, rgba(31,250,19,1) 50%, rgba(15,125,9,0.95) 80%, #001a00 100%),
                repeating-linear-gradient(90deg, rgba(0,0,0,0.9) 0px, rgba(255,255,255,0.08) 200px, rgba(0,0,0,0.9) 400px)
              `,
              backgroundBlendMode: "overlay",
              transform: `rotateY(-90deg) translateZ(-${CORRIDOR_WIDTH / 2}px)`,
              transformOrigin: "center center",
              left: `-${CORRIDOR_LENGTH / 2}px`,
              top: `-${(CORRIDOR_HEIGHT * 0.6) / 2}px`,
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            }}
          >
            {allPaintings.map((p, i) => (
              <Painting
                key={`right-${i}`}
                src={p.rightSrc}
                posX={CORRIDOR_LENGTH - p.depth}
                posY={(CORRIDOR_HEIGHT * 0.6) / 2}
                rot={p.rightRot}
              />
            ))}
          </div>

          {/* BACKGROUND GIGACHAD VIDEO (Always floats HORIZON_DEPTH pixels away from camera) */}
          <div
            style={{
              position: "absolute",
              width: `${HORIZON_DEPTH * 1.8}px`,   // Original proportionate size
              height: `${HORIZON_DEPTH * 1.8}px`,
              left: `-${(HORIZON_DEPTH * 1.8) / 2}px`,
              top: `-${(HORIZON_DEPTH * 1.8) / 2}px`,
              // Push the video slightly down so his eyes (top of video) sit exactly at the Y=0 vanishing point
              transform: `translateZ(-${cameraZ + HORIZON_DEPTH}px) translateY(450px)`,
              backgroundColor: "black",
              zIndex: -1,
              opacity: 1,
            }}
          >
            <video
              src="https://res.cloudinary.com/dhwd9gz6o/video/upload/v1772072968/gigachad_grab2_kkyhfg.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              disablePictureInPicture
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </div>
        </div>
      </div>

      {/* ====== CTA TEXT — always centered ====== */}
      <a
        href="https://chat.whatsapp.com/CSWvtoK3lmY1Wlye06FcjK"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "absolute",
          left: "50%",
          top: "70%",
          transform: "translate(-50%, -50%) scaleY(1.8)",
          zIndex: 15,
          color: "#1ffa13",
          fontFamily: "Impact, 'Arial Black', sans-serif",
          fontSize: "48px",
          textDecoration: "none",
          textShadow: "0 0 20px rgba(31,250,19,0.6), 0 2px 8px rgba(0,0,0,0.5)",
          lineHeight: 0.9,
          textAlign: "center" as const,
          cursor: "pointer",
          userSelect: "none" as const,
          animation: "blink 1s step-end infinite",
        }}
        data-hover="true"
      >
        <span style={{ display: "block", letterSpacing: "8px" }}>ENTRA</span>
        <span style={{ display: "block", letterSpacing: "14px" }}>YA ! !</span>
        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.2; }
          }
        `}</style>
      </a>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
    </div>
  );
}