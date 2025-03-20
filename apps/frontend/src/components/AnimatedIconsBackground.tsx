export default function AnimatedIconsBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden backdrop-blur-lg">
      <div 
        className="absolute inset-0 animate-tile-bg backdrop-blur-[12px]"
        style={{
          backgroundImage: 'url("/images/tiling.webp")',
          backgroundSize: '200px 200px',
          backgroundRepeat: 'repeat',
          opacity: 0.1
        }}
      />
    </div>
  );
}
