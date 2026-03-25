import React from 'react';

interface LoadingScreenProps {
  fadeOut?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ fadeOut }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'Impact, "Arial Black", sans-serif',
      opacity: fadeOut ? 0 : 1,
      pointerEvents: fadeOut ? 'none' : 'auto',
      transition: 'opacity 0.8s ease-out',
    }}>
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#1ffa13',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: `${i * 0.16}s`,
              boxShadow: '0 0 15px rgba(31, 250, 19, 0.6)',
            }}
          />
        ))}
      </div>
      <h2 style={{
        color: '#1ffa13',
        fontSize: '32px',
        letterSpacing: '4px',
        textShadow: '0 0 20px rgba(31, 250, 19, 0.6)',
        margin: 0,
        textAlign: 'center',
        padding: '0 20px'
      }}>
        CARGANDO SEMPI...
      </h2>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
