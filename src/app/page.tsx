"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// 14 painting images (WebP for smaller file size)
const PAINTING_IMAGES = [
  "/cuadro1.webp", "/cuadro2.webp", "/cuadro3.webp", "/cuadro4.webp",
  "/cuadro5.webp", "/cuadro6.webp", "/cuadro7.webp", "/cuadro8.webp",
  "/cuadro10.webp", "/cuadro11.webp", "/cuadro12.webp",
  "/cuadro13.webp", "/cuadro14.webp",
  "/cuadro15.webp", "/cuadro16.webp", "/cuadro17.webp", "/cuadro18.webp",
  "/cuadro19.webp", "/cuadro20.webp", "/cuadro21.webp", "/cuadro22.webp",
];

// Fixed zigzag order: paintings 1→14, paired left/right on each row
// Row 1: cuadro1 (left) + cuadro2 (right), Row 2: cuadro3 (left) + cuadro4 (right), …
const PAINTING_ROWS: {
  left: string;
  right: string;
  leftRot: number;
  rightRot: number;
}[] = [];
for (let i = 0; i < PAINTING_IMAGES.length; i += 2) {
  PAINTING_ROWS.push({
    left: PAINTING_IMAGES[i],
    right: PAINTING_IMAGES[i + 1] ?? PAINTING_IMAGES[0], // fallback if odd count
    leftRot: ((i % 5) - 2) * 0.8,
    rightRot: (((i + 1) % 5) - 2) * 0.8,
  });
}

const TOTAL_ROWS = PAINTING_ROWS.length;
const ROW_DEPTH = 500;
const LOOP_LENGTH = TOTAL_ROWS * ROW_DEPTH;
const SPEED = 55; // px/s

// Copies are set dynamically based on device (3 desktop, 1 mobile)
// to reduce memory pressure on mobile devices

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
  size,
  frame,
}: {
  src: string;
  posX: number;
  posY: number;
  rot: number;
  size: number;
  frame: number;
}) {
  // Skip rendering when this side has no painting (zigzag pattern)
  if (!src) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: `${posX - frame / 2}px`,
        top: `${posY - frame / 2 - 15}px`,
        transform: `rotate(${rot}deg)`,
      }}
    >
      <div
        style={{
          width: `${frame}px`,
          height: `${frame}px`,
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
          loading="eager"
          decoding="async"
          fetchPriority="low"
          onError={(e) => {
            // Hide broken images gracefully
            (e.currentTarget.parentElement as HTMLElement).style.visibility = "hidden";
          }}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            objectFit: "cover",
            borderRadius: "1px",
            display: "block",
          }}
        />
      </div>
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
  const [isMobile, setIsMobile] = useState(false);
  const [soldado1Img, setSoldado1Img] = useState<string>("/soldado1.webp");

  useEffect(() => {
    setSoldado1Img(Math.random() > 0.5 ? "/soldado1b.webp" : "/soldado1.webp");
  }, []);

  // Reduce corridor copies on mobile to lower memory pressure
  const copies = isMobile ? 2 : 3;
  const corridorLength = LOOP_LENGTH * copies;

  const paintingSize = PAINTING_SIZE;
  const framedSize = FRAMED_SIZE;
  const ribbonHeight = CORRIDOR_HEIGHT * 0.6;

  // Detect mobile / portrait screens
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || window.innerHeight > window.innerWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Preload all painting images before revealing the page (skip on mobile)
  useEffect(() => {
    let cancelled = false;
    if (isMobile) {
      // On mobile we skip painting images entirely, so reveal immediately
      setReady(true);
      return;
    }
    const preload = async () => {
      await Promise.all(
        PAINTING_IMAGES.map(
          (src) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => resolve(); // don't block on broken images
              img.src = src;
            })
        )
      );
      if (!cancelled) setReady(true);
    };
    preload();
    // Safety fallback: show page after 10s even if images haven't loaded
    const fallback = setTimeout(() => { if (!cancelled) setReady(true); }, 10000);
    return () => { cancelled = true; clearTimeout(fallback); };
  }, [isMobile]);

  // Track page state: 0 = Hero CTA, 1 = Members Grid
  const [pageState, setPageState] = useState(0);
  const scrollLock = useRef(false);
  const touchStartY = useRef(0);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollLock.current) return;
      if (e.deltaY > 30 && pageState === 0) {
        setPageState(1);
        scrollLock.current = true;
        setTimeout(() => scrollLock.current = false, 1000);
      } else if (e.deltaY < -30 && pageState === 1) {
        setPageState(0);
        scrollLock.current = true;
        setTimeout(() => scrollLock.current = false, 1000);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (scrollLock.current) return;
      const deltaY = touchStartY.current - e.touches[0].clientY;
      if (deltaY > 30 && pageState === 0) {
        setPageState(1);
        scrollLock.current = true;
        setTimeout(() => scrollLock.current = false, 1000);
      } else if (deltaY < -30 && pageState === 1) {
        setPageState(0);
        scrollLock.current = true;
        setTimeout(() => scrollLock.current = false, 1000);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [pageState]);

  const isMembers = pageState === 1;

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

  for (let copy = 0; copy < copies; copy++) {
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
    <div style={{ height: "100vh", width: "100vw", background: "#000", position: "relative", overflow: "hidden" }}>
      <div
        ref={wrapperRef}
        onClick={() => {
          if (!isMembers) {
            window.open("https://chat.whatsapp.com/CSWvtoK3lmY1Wlye06FcjK", "_blank");
          }
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: isMobile ? undefined : "800px",
          perspectiveOrigin: isMobile ? undefined : "50% 50%",
          overflow: "hidden",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.8s ease-in",
          cursor: isMembers ? "default" : "pointer",
        }}
      >
        {/* ===== MOBILE LAYOUT: simple 2D strips + video background ===== */}
        {isMobile && (
          <>
            <style>{`
            @keyframes marquee-left {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes marquee-right {
              0%   { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            .mobile-strip {
              position: absolute;
              left: 0;
              width: 100%;
              overflow: hidden;
              z-index: 5;
              pointer-events: none;
            }
            .mobile-strip-inner {
              display: flex;
              gap: 10px;
              width: max-content;
              will-change: transform;
            }
            .mobile-strip-inner img {
              width: 110px;
              height: 110px;
              object-fit: cover;
              border-radius: 4px;
              border: 2px solid rgba(201,168,76,0.7);
              flex-shrink: 0;
            }
          `}</style>

            {/* Gigachad as simple fullscreen background */}
            <video
              src="https://res.cloudinary.com/dhwd9gz6o/video/upload/v1772072968/gigachad_grab2_kkyhfg.mp4"
              autoPlay
              loop
              muted
              playsInline
              // @ts-ignore
              webkit-playsinline=""
              preload="none"
              controls={false}
              disablePictureInPicture
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                zIndex: 0,
              }}
            />


            {/* BOTTOM STRIP — scrolls left to right */}
            <div className="mobile-strip" style={{ bottom: "5%", transform: isMembers ? "translateY(-15vh)" : "translateY(0)", transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1)" }}>
              <div
                className="mobile-strip-inner"
                style={{ animation: "marquee-right 80s linear infinite" }}
              >
                {[...PAINTING_IMAGES, ...PAINTING_IMAGES].map((src, i) => (
                  <img key={`bot-${i}`} src={src} alt="" loading="lazy" />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== DESKTOP LAYOUT: full 3D corridor ===== */}
        {!isMobile && (
          <div className="mobile-scaler" style={{ transformStyle: "preserve-3d", transform: isMembers ? "translateY(-15vh)" : "translateY(0)", transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1)" }}>
            <div
              className="corridor-scene"
              style={{
                transformStyle: "preserve-3d",
                transform: `translateZ(${cameraZ}px)`,
                position: "relative",
                willChange: "transform",
                width: 0,
                height: 0,
              }}
            >
              {/* --- TOP RIBBON --- */}
              <div
                style={{
                  position: "absolute",
                  width: `${CORRIDOR_WIDTH * 1.5}px`,
                  height: `${corridorLength}px`,
                  backgroundImage: `
                linear-gradient(90deg, #001a00 0%, rgba(15,125,9,0.95) 20%, rgba(31,250,19,1) 50%, rgba(15,125,9,0.95) 80%, #001a00 100%),
                repeating-linear-gradient(0deg, rgba(0,0,0,0.9) 0px, rgba(255,255,255,0.08) 200px, rgba(0,0,0,0.9) 400px)
              `,
                  backgroundBlendMode: "overlay",
                  transform: `rotateX(-90deg) translateZ(-${CORRIDOR_HEIGHT / 2}px)`,
                  transformOrigin: "center center",
                  left: `-${(CORRIDOR_WIDTH * 1.5) / 2}px`,
                  top: `-${corridorLength}px`,
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
                  height: `${corridorLength}px`,
                  backgroundColor: "#001a00",
                  backgroundImage: `
                linear-gradient(90deg, #001a00 0%, rgba(15,125,9,0.9) 20%, rgba(31,250,19,1) 50%, rgba(15,125,9,0.9) 80%, #001a00 100%),
                repeating-linear-gradient(0deg, rgba(0,0,0,0.9) 0px, rgba(255,255,255,0.08) 200px, rgba(0,0,0,0.9) 400px)
              `,
                  backgroundBlendMode: "overlay",
                  transform: `rotateX(90deg) translateZ(${CORRIDOR_HEIGHT / 2}px)`,
                  transformOrigin: "center center",
                  left: `-${(CORRIDOR_WIDTH * 1.5) / 2}px`,
                  top: `-${corridorLength}px`,
                  boxShadow: "0 -20px 50px rgba(0,0,0,0.8)",
                }}
              />

              {/* --- LEFT RIBBON --- */}
              <div
                style={{
                  position: "absolute",
                  width: `${corridorLength}px`,
                  height: `${ribbonHeight}px`,
                  backgroundImage: `
                linear-gradient(180deg, #001a00 0%, rgba(15,125,9,0.95) 20%, rgba(31,250,19,1) 50%, rgba(15,125,9,0.95) 80%, #001a00 100%),
                repeating-linear-gradient(90deg, rgba(0,0,0,0.9) 0px, rgba(255,255,255,0.08) 200px, rgba(0,0,0,0.9) 400px)
              `,
                  backgroundBlendMode: "overlay",
                  transform: `rotateY(90deg) translateZ(-${CORRIDOR_WIDTH / 2}px)`,
                  transformOrigin: "center center",
                  left: `-${corridorLength / 2}px`,
                  top: `-${ribbonHeight / 2}px`,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                }}
              >
                {allPaintings.map((p, i) => (
                  <Painting
                    key={`left-${i}`}
                    src={p.leftSrc}
                    posX={p.depth}
                    posY={ribbonHeight / 2}
                    rot={p.leftRot}
                    size={paintingSize}
                    frame={framedSize}
                  />
                ))}
              </div>

              {/* --- RIGHT RIBBON --- */}
              <div
                style={{
                  position: "absolute",
                  width: `${corridorLength}px`,
                  height: `${ribbonHeight}px`,
                  backgroundImage: `
                linear-gradient(180deg, #001a00 0%, rgba(15,125,9,0.95) 20%, rgba(31,250,19,1) 50%, rgba(15,125,9,0.95) 80%, #001a00 100%),
                repeating-linear-gradient(90deg, rgba(0,0,0,0.9) 0px, rgba(255,255,255,0.08) 200px, rgba(0,0,0,0.9) 400px)
              `,
                  backgroundBlendMode: "overlay",
                  transform: `rotateY(-90deg) translateZ(-${CORRIDOR_WIDTH / 2}px)`,
                  transformOrigin: "center center",
                  left: `-${corridorLength / 2}px`,
                  top: `-${ribbonHeight / 2}px`,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                }}
              >
                {allPaintings.map((p, i) => (
                  <Painting
                    key={`right-${i}`}
                    src={p.rightSrc}
                    posX={corridorLength - p.depth}
                    posY={ribbonHeight / 2}
                    rot={p.rightRot}
                    size={paintingSize}
                    frame={framedSize}
                  />
                ))}
              </div>

              {/* BACKGROUND GIGACHAD VIDEO */}
              <div
                style={{
                  position: "absolute",
                  width: `${HORIZON_DEPTH * 1.8}px`,
                  height: `${HORIZON_DEPTH * 1.8}px`,
                  left: `-${(HORIZON_DEPTH * 1.8) / 2}px`,
                  top: `-${(HORIZON_DEPTH * 1.8) / 2}px`,
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
                  // @ts-ignore — webkit vendor attribute for older iOS
                  webkit-playsinline=""
                  preload="metadata"
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
        )}

        {/* ====== CTA TEXT & MEMBERS SECTION ====== */}
        <a
          href="https://chat.whatsapp.com/CSWvtoK3lmY1Wlye06FcjK"
          target="_blank"
          rel="noopener noreferrer"
          className="cta-text"
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
            whiteSpace: "nowrap" as const,
            opacity: isMembers ? 0 : 1,
            pointerEvents: isMembers ? "none" : "auto",
            transition: "opacity 0.6s ease-out",
            display: isMembers ? "none" : "block",
          }}
          data-hover="true"
        >
          <span style={{ display: "block", letterSpacing: "8px" }}>ENTRA AHORA !!</span>
          <span style={{ display: "block", letterSpacing: "8px" }}>HAZ CLICK YA !!</span>
          <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.2; }
          }
          @media (max-width: 600px) {
            .cta-text {
              font-size: 24px !important;
              letter-spacing: 4px !important;
            }
          }
        `}</style>
        </a>

        {/* ====== MIEMBROS DESTACADOS ====== */}
        <div
          style={{
            position: "absolute",
            top: "60%",
            left: "50%",
            transform: isMembers ? "translate(-50%, -50%)" : "translate(-50%, -10px)",
            opacity: isMembers ? 1 : 0,
            transition: "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
            zIndex: 20,
            color: "#1ffa13",
            fontFamily: "Impact, 'Arial Black', sans-serif",
            textAlign: "center" as const,
            pointerEvents: isMembers ? "auto" : "none",
            width: "100%",
          }}
        >
          <h2 style={{
            fontSize: isMobile ? "32px" : "48px",
            textShadow: "0 0 20px rgba(31,250,19,0.6)",
            marginBottom: "30px",
            whiteSpace: "nowrap" as const,
            letterSpacing: "4px"
          }}>
            SOLDADOS
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: isMobile ? "15px" : "30px",
              justifyContent: "center",
              margin: "0 auto",
              width: "fit-content",
            }}
          >
            {[
              { id: 1, name: "Marc Badua", code: "#B4DU4", role: "Soldado remoto en tierras canarias investigando actualmente el narcotráfico en las islas.", img: soldado1Img },
              { id: 11, code: "#000", role: "Sargento Sempi.", img: null },
              { id: 33, code: "#000", role: "Sargento Sempi.", img: null },
              { id: 44, code: "#000", role: "Sargento Sempi.", img: null },
              { id: 47, code: "#000", role: "Sargento Sempi.", img: null },
              { id: 57, code: "#000", role: "Sargento Sempi.", img: null },
              { id: 59, code: "#000", role: "Sargento Sempi.", img: null }
            ].map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member.id)}
                style={{
                  width: isMobile ? "80px" : "120px",
                  height: isMobile ? "80px" : "120px",
                  borderRadius: "12px",
                  border: "3px solid #1ffa13",
                  overflow: "hidden",
                  boxShadow: "0 0 20px rgba(31,250,19,0.4)",
                  background: "#111",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                {member.img ? (
                  <img src={member.img} alt={member.name || member.code} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="#333" style={{ width: "80%", height: "80%" }}>
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

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

        {/* ====== MEMBER INFO MODAL ====== */}
        {selectedMember !== null && (
          <div
            onClick={() => setSelectedMember(null)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(5px)",
              animation: "fadeIn 0.3s ease-out",
              cursor: "pointer"
            }}
          >
            {[
              { id: 1, name: "Marc Badua", code: "#B4DU4", role: "Soldado remoto en tierras canarias investigando actualmente el narcotráfico en las islas.", img: soldado1Img },
              { id: 11, code: "#000", role: "Sargento Sempi.", img: null },
              { id: 33, code: "#000", role: "Sargento Sempi.", img: null },
              { id: 44, code: "#000", role: "Sargento Sempi.", img: null },
              { id: 47, code: "#000", role: "Sargento Sempi.", img: null },
              { id: 57, code: "#000", role: "Sargento Sempi.", img: null },
              { id: 59, code: "#000", role: "Sargento Sempi.", img: null }
            ].filter(m => m.id === selectedMember).map(member => (
              <div
                key={member.id}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "linear-gradient(135deg, #0a1f0a 0%, #000 100%)",
                  border: "2px solid #1ffa13",
                  borderRadius: "16px",
                  padding: "40px",
                  width: "90%",
                  maxWidth: "500px",
                  boxShadow: "0 0 40px rgba(31,250,19,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                  color: "white",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  textAlign: "center" as const,
                  cursor: "default"
                }}
              >
                <div style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  border: "4px solid #1ffa13",
                  overflow: "hidden",
                  background: "#111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {member.img ? (
                    <img src={member.img} alt={member.name || member.code} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="#333" style={{ width: "80%", height: "80%" }}>
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                <h3 style={{ fontSize: "28px", color: "#1ffa13", margin: 0, letterSpacing: "2px" }}>{member.code}</h3>
                <p style={{ fontSize: "16px", color: "#aaa", lineHeight: 1.5, margin: 0 }}>
                  {member.role}
                </p>
                <button
                  onClick={() => window.open("https://chat.whatsapp.com/CSWvtoK3lmY1Wlye06FcjK", "_blank")}
                  style={{
                    marginTop: "15px",
                    background: "#1ffa13",
                    color: "#000",
                    border: "none",
                    padding: "15px 30px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    cursor: "pointer",
                    boxShadow: "0 0 15px rgba(31,250,19,0.5)",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                  CONÓCELO !!
                </button>
              </div>
            ))}
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}