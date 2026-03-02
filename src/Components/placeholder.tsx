
interface PlaceholderProps {
  width?: number | string;
  height?: number;
}
const Placeholder = ({ width = '100%', height = 20 }: PlaceholderProps) => {
  return (
    <div
      style={{
        width: width,
        height: height,
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        animation: 'pulse 2s ease-in-out infinite'
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Placeholder;