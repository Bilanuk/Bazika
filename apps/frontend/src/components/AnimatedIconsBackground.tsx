import { Film, Clapperboard, Play, Tv2, MonitorPlay, Video, Youtube, Tv, Camera, Projector, MonitorStop, Airplay, ScreenShare, MonitorSmartphone } from 'lucide-react';

export default function AnimatedIconsBackground() {
  const icons = [
    Film, Clapperboard, Play, Tv2, MonitorPlay, 
    Video, Youtube, Tv, Camera, Projector, 
    MonitorStop, Airplay, ScreenShare, MonitorSmartphone
  ];

  const GRID_ROWS = 16;
  const GRID_COLS = 16;

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 animate-slide-diagonal blur-[1px]">
        <div className="relative h-[200%] w-[200%] -translate-x-[25%] -translate-y-[25%] rotate-[30deg]">
          <div 
            className="absolute inset-0 grid gap-8 p-4"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`
            }}
          >
            {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => {
              const Icon = icons[i % icons.length];
              return <Icon key={i} className="h-10 w-10 text-primary/30" strokeWidth={1} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 