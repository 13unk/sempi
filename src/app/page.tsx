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

const CORRIDOR_WIDTH = 600;
const CORRIDOR_HEIGHT = 400;
const PAINTING_SIZE = 240;
const FRAME_WIDTH = 4;
const FRAMED_SIZE = PAINTING_SIZE + FRAME_WIDTH * 2;

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

  // Scroll wheel: up = faster (scrolling down/backwards is disabled)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        // Scroll up → speed up
        speedMultiplierRef.current = Math.min(speedMultiplierRef.current + 0.5, 5);
      }
      // Scrolling backwards (deltaY > 0) no longer slows it down manually
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
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "800px",
        perspectiveOrigin: "50% 50%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* 3D corridor scene */}
      <div className="mobile-scaler" style={{ transformStyle: "preserve-3d" }}>
        <style>{`
          /* Escalar el escenario en pantallas verticales sin deformar los cuadros */
          @media (max-aspect-ratio: 1/1) {
            .mobile-scaler {
              transform: scale(1.9) !important;
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
          {/* FLOOR — carpet pattern */}
          <div
            style={{
              position: "absolute",
              width: `${CORRIDOR_WIDTH}px`,
              height: `${CORRIDOR_LENGTH}px`,
              backgroundColor: "#6b1c23",
              backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent 0px, transparent 38px,
                rgba(139,28,35,0.6) 38px, rgba(139,28,35,0.6) 40px
              ),
              repeating-linear-gradient(
                90deg,
                transparent 0px, transparent 38px,
                rgba(139,28,35,0.6) 38px, rgba(139,28,35,0.6) 40px
              ),
              repeating-linear-gradient(
                0deg,
                transparent 0px, transparent 118px,
                rgba(180,140,60,0.35) 118px, rgba(180,140,60,0.35) 122px
              ),
              repeating-linear-gradient(
                90deg,
                transparent 0px, transparent 118px,
                rgba(180,140,60,0.35) 118px, rgba(180,140,60,0.35) 122px
              )
            `,
              transform: `rotateX(90deg) translateZ(${CORRIDOR_HEIGHT / 2}px)`,
              transformOrigin: "center center",
              left: `-${CORRIDOR_WIDTH / 2}px`,
              top: `-${CORRIDOR_LENGTH}px`,
            }}
          />

          {/* CEILING */}
          <div
            style={{
              position: "absolute",
              width: `${CORRIDOR_WIDTH}px`,
              height: `${CORRIDOR_LENGTH}px`,
              background: "#111",
              transform: `rotateX(-90deg) translateZ(-${CORRIDOR_HEIGHT / 2}px)`,
              transformOrigin: "center center",
              left: `-${CORRIDOR_WIDTH / 2}px`,
              top: `-${CORRIDOR_LENGTH}px`,
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

          {/* LEFT WALL */}
          <div
            style={{
              position: "absolute",
              width: `${CORRIDOR_LENGTH}px`,
              height: `${CORRIDOR_HEIGHT}px`,
              background:
                "linear-gradient(180deg, #1e1e1e 0%, #252525 50%, #1a1a1a 100%)",
              transform: `rotateY(90deg) translateZ(-${CORRIDOR_WIDTH / 2}px)`,
              transformOrigin: "center center",
              left: `-${CORRIDOR_LENGTH / 2}px`,
              top: `-${CORRIDOR_HEIGHT / 2}px`,
            }}
          >
            {allPaintings.map((p, i) => (
              <Painting
                key={`left-${i}`}
                src={p.leftSrc}
                posX={p.depth}
                posY={CORRIDOR_HEIGHT / 2}
                rot={p.leftRot}
              />
            ))}
          </div>

          {/* RIGHT WALL */}
          <div
            style={{
              position: "absolute",
              width: `${CORRIDOR_LENGTH}px`,
              height: `${CORRIDOR_HEIGHT}px`,
              background:
                "linear-gradient(180deg, #1e1e1e 0%, #252525 50%, #1a1a1a 100%)",
              transform: `rotateY(-90deg) translateZ(-${CORRIDOR_WIDTH / 2}px)`,
              transformOrigin: "center center",
              left: `-${CORRIDOR_LENGTH / 2}px`,
              top: `-${CORRIDOR_HEIGHT / 2}px`,
            }}
          >
            {allPaintings.map((p, i) => (
              <Painting
                key={`right-${i}`}
                src={p.rightSrc}
                posX={CORRIDOR_LENGTH - p.depth}
                posY={CORRIDOR_HEIGHT / 2}
                rot={p.rightRot}
              />
            ))}
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
          color: "#9b5de5",
          fontFamily: "Impact, 'Arial Black', sans-serif",
          fontSize: "48px",
          textDecoration: "none",
          textShadow: "0 0 20px rgba(155,93,229,0.6), 0 2px 8px rgba(0,0,0,0.5)",
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