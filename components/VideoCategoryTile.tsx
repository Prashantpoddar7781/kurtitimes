import React, { useRef, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface VideoCategoryTileProps {
  videoSrc: string;
  name: string;
  tagline: string;
  onClick: () => void;
  animationDelay: string;
}

const VideoCategoryTile: React.FC<VideoCategoryTileProps> = ({ 
  videoSrc, 
  name, 
  tagline, 
  onClick,
  animationDelay 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video to play only first 5 seconds
    const handleTimeUpdate = () => {
      if (video.currentTime >= 5) {
        video.currentTime = 0;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    // Intersection Observer to play when in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            video.play().catch(() => {
              // Autoplay was prevented, user interaction required
            });
          } else {
            setIsInView(false);
            video.pause();
          }
        });
      },
      {
        threshold: 0.3, // Play when 30% of video is visible
      }
    );

    observer.observe(video);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      observer.disconnect();
    };
  }, []);

  return (
    <button 
      onClick={onClick}
      className="group relative h-[450px] overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-8 text-left translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <p className="text-brand-300 text-xs font-bold uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{tagline}</p>
        <h3 className="text-2xl font-serif font-bold text-white mb-2">{name}</h3>
        <div className="flex items-center gap-2 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
          View Collection <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
};

export default VideoCategoryTile;

