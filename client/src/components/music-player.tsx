import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAudio } from "@/lib/audio-context";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Heart, 
  Sparkles, 
  Gem 
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function MusicPlayer() {
  const { 
    state, 
    togglePlay, 
    setCurrentTime, 
    setVolume, 
    nextTrack, 
    previousTrack, 
    formatTime 
  } = useAudio();
  const progressRef = useRef<HTMLDivElement>(null);

  const incrementPlayMutation = useMutation({
    mutationFn: async (trackId: number) => {
      return await apiRequest("POST", `/api/tracks/${trackId}/play`, {});
    },
  });

  useEffect(() => {
    if (state.isPlaying && state.currentTrack) {
      const timer = setInterval(() => {
        if (state.currentTime < state.duration) {
          setCurrentTime(state.currentTime + 1);
        } else {
          nextTrack();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state.isPlaying, state.currentTime, state.duration, setCurrentTime, nextTrack]);

  useEffect(() => {
    if (state.currentTrack && state.isPlaying) {
      incrementPlayMutation.mutate(state.currentTrack.id);
    }
  }, [state.currentTrack?.id, state.isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = Math.floor((clickX / width) * state.duration);
      setCurrentTime(newTime);
    }
  };

  if (!state.currentTrack) return null;

  const progressPercentage = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-dark-secondary/95 backdrop-blur-sm border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Track info */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <img 
              src={state.currentTrack.albumArt || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100"}
              alt={state.currentTrack.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <p className="font-semibold truncate text-white">{state.currentTrack.title}</p>
              <p className="text-sm text-gray-400 truncate">{state.currentTrack.artist}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-accent-purple">
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {/* Player controls */}
          <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousTrack}
                className="text-gray-400 hover:text-white"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={togglePlay}
                className="bg-white text-dark-primary p-3 rounded-full hover:scale-105 transition-transform"
                disabled={state.isLoading}
              >
                {state.isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-1" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={nextTrack}
                className="text-gray-400 hover:text-white"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Progress bar */}
            <div className="flex items-center space-x-2 w-full">
              <span className="text-xs text-gray-400 min-w-[35px]">
                {formatTime(state.currentTime)}
              </span>
              <div 
                ref={progressRef}
                className="flex-1 bg-gray-700 rounded-full h-1 relative cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="bg-gradient-to-r from-purple-400 to-cyan-400 h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 min-w-[35px]">
                {formatTime(state.duration)}
              </span>
            </div>
          </div>

          {/* Volume and options */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-accent-amber">
              <Sparkles className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-accent-cyan">
              <Gem className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <Slider
                value={[state.volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={100}
                step={1}
                className="w-16"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
