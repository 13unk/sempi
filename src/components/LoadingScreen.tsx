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
        width: '80px',
        height: '80px',
        border: '8px solid rgba(31, 250, 19, 0.1)',
        borderTop: '8px solid #1ffa13',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px',
        boxShadow: '0 0 20px rgba(31, 250, 19, 0.4)',
      }} />
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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
