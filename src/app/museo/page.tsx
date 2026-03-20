"use client";

import { PAINTING_IMAGES } from "@/constants/images";
import { useState } from "react";

export default function Museo() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  return (
    <div style={{ 
      height: "100vh", 
      width: "100%", 
      overflowY: "auto",
      overflowX: "hidden",
      background: "#000", 
      color: "#1ffa13",
      padding: "40px 10px",
      fontFamily: "Impact, 'Arial Black', sans-serif"
    }}>
      <style>{`
        .museo-title {
          text-align: center;
          font-size: 32px;
          margin-bottom: 30px;
          text-shadow: 0 0 20px rgba(31,250,19,0.6);
          letter-spacing: 2px;
        }
        .museo-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        @media (min-width: 600px) {
          .museo-title {
            font-size: 48px;
            margin-bottom: 40px;
            letter-spacing: 4px;
          }
          .museo-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
          }
        }
      `}</style>

      <h1 className="museo-title">
        MUSEO SEMPI
      </h1>
      
      <div className="museo-grid">
        {PAINTING_IMAGES.map((src, i) => (
          <div 
            key={i}
            onClick={() => setSelectedImg(src)}
            style={{
              aspectRatio: "1",
              background: "linear-gradient(135deg, #c9a84c, #8a6914, #c9a84c)",
              padding: "4px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "transform 0.2s",
              boxShadow: "0 4px 20px rgba(0,0,0,0.6)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <img 
              src={src} 
              alt={`Cuadro ${i}`} 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover",
                borderRadius: "2px"
              }} 
            />
          </div>
        ))}
      </div>

      {/* Lightbox / Modal */}
      {selectedImg && (
        <div 
          onClick={() => setSelectedImg(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px"
          }}
        >
          <img 
            src={selectedImg} 
            alt="Zoom" 
            style={{ 
              maxWidth: "90%", 
              maxHeight: "90%", 
              border: "4px solid #c9a84c",
              borderRadius: "8px",
              boxShadow: "0 0 50px rgba(31,250,19,0.3)"
            }} 
          />
        </div>
      )}
    </div>
  );
}
