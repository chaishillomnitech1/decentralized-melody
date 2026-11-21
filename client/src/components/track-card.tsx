import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Heart, Headphones } from "lucide-react";
import { useAudio } from "@/lib/audio-context";
import type { Track } from "@shared/schema";

interface TrackCardProps {
  track: Track;
}

export function TrackCard({ track }: TrackCardProps) {
  const { playTrack, state } = useAudio();
  
  const isCurrentTrack = state.currentTrack?.id === track.id;
  const isPlaying = isCurrentTrack && state.isPlaying;

  const handlePlay = () => {
    if (isCurrentTrack) {
      // If it's the current track, let the music player handle toggle
      return;
    }
    playTrack(track);
  };

  const formatPlayCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="bg-dark-secondary rounded-xl p-6 hover:bg-dark-tertiary transition-colors border border-gray-800 hover:border-accent-purple/30 group">
      <div className="relative">
        <img 
          src={track.albumArt || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300"}
          alt={track.title}
          className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
        />
        <Button
          onClick={handlePlay}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
            isCurrentTrack 
              ? "bg-accent-purple text-white" 
              : "bg-black/50 hover:bg-accent-purple text-white"
          }`}
          size="sm"
        >
          <Play className={`w-4 h-4 ${isPlaying ? "animate-pulse" : ""}`} />
        </Button>
      </div>
      
      <h3 className="font-semibold mb-2 text-white">{track.title}</h3>
      <p className="text-gray-400 mb-4">{track.artist}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {track.aiTags && track.aiTags.length > 0 && (
            <Badge variant="secondary" className="bg-accent-purple/20 text-accent-purple">
              AI Tagged
            </Badge>
          )}
          <span className="text-gray-400 text-sm flex items-center">
            <Headphones className="w-3 h-3 mr-1" />
            {formatPlayCount(track.playCount)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-accent-red">
            <Heart className="w-4 h-4" />
          </Button>
          <span className="text-gray-400 text-sm">{track.likes}</span>
        </div>
      </div>
      
      {track.mood && (
        <div className="mt-3">
          <Badge variant="outline" className="border-accent-cyan/30 text-accent-cyan">
            {track.mood}
          </Badge>
        </div>
      )}
    </div>
  );
}
