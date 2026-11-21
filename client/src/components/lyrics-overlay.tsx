import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAudio } from "@/lib/audio-context";
import type { Lyrics } from "@shared/schema";

interface LyricsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LyricsOverlay({ isOpen, onClose }: LyricsOverlayProps) {
  const { state } = useAudio();

  const { data: lyrics, isLoading } = useQuery<Lyrics[]>({
    queryKey: ["/api/tracks", state.currentTrack?.id, "lyrics"],
    enabled: isOpen && !!state.currentTrack?.id,
  });

  if (!state.currentTrack) return null;

  const mockLyrics = {
    content: "In the digital dawn we rise\nElectric dreams illuminate our eyes\nThrough circuits of light we transcend\nWhere reality and virtuality blend",
    aiTags: ["hopeful", "futuristic", "inspirational", "technology"]
  };

  const getTagColor = (tag: string) => {
    const colors = {
      hopeful: "accent-purple",
      futuristic: "accent-cyan", 
      inspirational: "accent-amber",
      technology: "accent-red",
      dreamy: "purple-400",
      energetic: "cyan-400",
      intense: "red-400",
      atmospheric: "amber-400"
    };
    return colors[tag as keyof typeof colors] || "gray-400";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-secondary border-accent-amber/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3 text-2xl">
            <Sparkles className="text-accent-amber" />
            <span>AI-Enhanced Lyrics</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple"></div>
            </div>
          ) : (
            <div className="bg-dark-tertiary rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-accent-amber font-semibold">Verse 1</span>
                <Badge className="bg-accent-purple/20 text-accent-purple">
                  NFT Available
                </Badge>
              </div>
              
              <p className="text-lg leading-relaxed mb-4 text-gray-300 whitespace-pre-line">
                {lyrics?.[0]?.content || mockLyrics.content}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {(lyrics?.[0]?.aiTags || mockLyrics.aiTags).map((tag, index) => (
                  <Badge
                    key={index}
                    className={`bg-${getTagColor(tag)}/20 text-${getTagColor(tag)}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="bg-dark-tertiary rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-accent-cyan font-semibold">Chorus</span>
              <Badge className="bg-accent-cyan/20 text-accent-cyan">
                NFT Available
              </Badge>
            </div>
            
            <p className="text-lg leading-relaxed mb-4 text-gray-300">
              "Electric dreams illuminate the night<br/>
              Where data flows like rivers of light<br/>
              In this realm where souls connect<br/>
              Digital hearts beat in perfect sync"
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-purple-400/20 text-purple-400">dreamy</Badge>
              <Badge className="bg-cyan-400/20 text-cyan-400">energetic</Badge>
              <Badge className="bg-amber-400/20 text-amber-400">euphoric</Badge>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              AI analysis powered by advanced NLP models
            </p>
            <Button 
              className="gradient-purple-cyan"
              onClick={() => {
                // Navigate to NFT marketplace for this track
                onClose();
              }}
            >
              View Track NFTs
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
