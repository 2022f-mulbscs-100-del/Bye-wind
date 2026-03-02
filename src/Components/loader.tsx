import React from 'react';

const Loader = ({ size = 40, color = '#3b82f6' }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `${size / 10}px solid rgba(0, 0, 0, 0.1)`,
        borderTop: `${size / 10}px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
