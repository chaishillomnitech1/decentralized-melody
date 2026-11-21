import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TrackCard } from "@/components/track-card";
import { NFTCard } from "@/components/nft-card";
import { LyricsOverlay } from "@/components/lyrics-overlay";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Palette, Upload, TrendingUp, Bot, Eye } from "lucide-react";
import type { Track, NFT } from "@shared/schema";

export default function Home() {
  const [showLyrics, setShowLyrics] = useState(false);

  const { data: trendingTracks, isLoading: tracksLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks/trending"],
  });

  const { data: featuredNFTs, isLoading: nftsLoading } = useQuery<NFT[]>({
    queryKey: ["/api/nfts/featured"],
  });

  const { data: creatorStats } = useQuery({
    queryKey: ["/api/creators/1/stats"],
  });

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-dark-primary to-cyan-500/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Featured Track */}
            <div className="animate-slide-up">
              <div className="bg-dark-secondary/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-500 font-semibold">NOW TRENDING</span>
                </div>
                
                <div className="flex items-center space-x-6 mb-8">
                  <img 
                    src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"
                    alt="Ethereal Dreams album cover"
                    className="w-24 h-24 rounded-xl shadow-lg object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Ethereal Dreams</h2>
                    <p className="text-accent-cyan font-semibold">Cosmic Wanderer</p>
                    <div className="flex items-center space-x-2 mt-3">
                      <Badge className="bg-accent-purple/20 text-accent-purple">NFT Available</Badge>
                      <Badge className="bg-accent-amber/20 text-accent-amber">AI Tagged</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button 
                    className="gradient-purple-cyan p-4 rounded-full hover:shadow-lg hover:shadow-purple-500/30 transition-all group"
                    onClick={() => setShowLyrics(true)}
                  >
                    <TrendingUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </Button>
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <span className="flex items-center"><TrendingUp className="w-4 h-4 mr-2" />24.5K plays</span>
                    <span>3.2K likes</span>
                    <span>12 NFTs sold</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured NFT */}
            <div className="animate-slide-up">
              <div className="bg-gradient-to-br from-accent-purple/10 to-accent-cyan/10 rounded-2xl p-8 border border-accent-purple/30">
                <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-accent-purple to-accent-cyan bg-clip-text text-transparent">
                  Featured Verse NFT
                </h3>
                
                <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"
                  alt="Digital art representing music and blockchain technology"
                  className="w-full h-48 object-cover rounded-xl mb-6"
                />
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">"Verse 2: Digital Prophecy"</h4>
                    <p className="text-gray-400">From "Ethereal Dreams"</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-accent-cyan">
                      <span className="text-sm">Current Bid</span>
                      <p className="text-xl font-bold">2.5 ETH</p>
                    </div>
                    <Button className="bg-accent-cyan text-dark-primary hover:bg-accent-cyan/90">
                      Place Bid
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Tracks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Trending Tracks</h2>
        {tracksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-dark-secondary rounded-xl p-6 animate-pulse">
                <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-700 h-4 rounded mb-2"></div>
                <div className="bg-gray-700 h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingTracks?.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        )}
      </section>

      {/* NFT Marketplace Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Verse NFT Marketplace</h2>
          <Button variant="ghost" className="text-accent-purple hover:text-accent-cyan">
            View All <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
        
        {nftsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-dark-secondary rounded-xl p-4 animate-pulse">
                <div className="bg-gray-700 h-32 rounded-lg mb-4"></div>
                <div className="bg-gray-700 h-3 rounded mb-2"></div>
                <div className="bg-gray-700 h-2 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredNFTs?.map((nft) => (
              <NFTCard key={nft.id} nft={nft} size="sm" />
            ))}
          </div>
        )}
      </section>

      {/* AI Lyrics & VibeCanvas Integration */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">AI-Enhanced Experiences</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Lyrics Panel */}
          <div className="bg-dark-secondary rounded-xl p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <Bot className="text-accent-amber text-xl" />
              <h3 className="text-xl font-semibold">AI-Tagged Lyrics</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-dark-tertiary rounded-lg p-4">
                <p className="text-gray-300 mb-2">"In the digital dawn we rise"</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-accent-purple/20 text-accent-purple">Hopeful</Badge>
                  <Badge className="bg-accent-cyan/20 text-accent-cyan">Futuristic</Badge>
                  <Badge className="bg-accent-amber/20 text-accent-amber">Inspirational</Badge>
                </div>
              </div>
              <Button 
                onClick={() => setShowLyrics(true)}
                className="w-full gradient-amber-red"
              >
                View Full AI Analysis
              </Button>
            </div>
          </div>

          {/* VibeCanvas Integration */}
          <div className="bg-gradient-to-br from-accent-purple/10 to-accent-cyan/10 rounded-xl p-6 border border-accent-purple/30">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="text-accent-purple text-xl" />
              <h3 className="text-xl font-semibold">VibeCanvas Sync</h3>
            </div>
            <div className="space-y-4">
              <img 
                src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=600"
                alt="Abstract colorful music visualization canvas"
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Real-time Visual Sync</p>
                  <p className="text-sm text-gray-400">Connected to "Ethereal Dreams"</p>
                </div>
                <Button className="bg-accent-purple text-white hover:bg-accent-purple/80">
                  <Palette className="mr-2 w-4 h-4" />
                  Open Canvas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Dashboard Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Creator Hub</h2>
        <div className="bg-dark-secondary rounded-xl p-8 border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Upload Section */}
            <div className="text-center">
              <div className="w-16 h-16 gradient-purple-cyan rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="text-white text-2xl" />
              </div>
              <h3 className="font-semibold mb-2">Upload Tracks</h3>
              <p className="text-gray-400 text-sm mb-4">Upload your music and create verse-based NFTs automatically</p>
              <Button className="bg-accent-purple text-white hover:bg-accent-purple/80">
                Start Upload
              </Button>
            </div>

            {/* Analytics */}
            <div className="text-center">
              <div className="w-16 h-16 gradient-cyan-amber rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-white text-2xl" />
              </div>
              <h3 className="font-semibold mb-2">Track Analytics</h3>
              <p className="text-gray-400 text-sm mb-4">Monitor plays, NFT sales, and earnings in real-time</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Plays:</span>
                  <span className="text-white font-semibold">{creatorStats?.totalPlays || "124.5K"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">NFTs Sold:</span>
                  <span className="text-accent-cyan font-semibold">{creatorStats?.nftsSold || "47"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Earnings:</span>
                  <span className="text-accent-amber font-semibold">{creatorStats?.earnings || "23.8 ETH"}</span>
                </div>
              </div>
            </div>

            {/* AI Tools */}
            <div className="text-center">
              <div className="w-16 h-16 gradient-amber-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="text-white text-2xl" />
              </div>
              <h3 className="font-semibold mb-2">AI Enhancement</h3>
              <p className="text-gray-400 text-sm mb-4">Automatic lyrics tagging and mood analysis for your tracks</p>
              <Button className="bg-accent-amber text-dark-primary hover:bg-accent-amber/80">
                Enhance Track
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Secret Prophecies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-accent-red/20 via-accent-purple/20 to-accent-cyan/20 rounded-xl p-8 border border-accent-red/30">
          <div className="flex items-center space-x-3 mb-6">
            <Eye className="text-accent-red text-2xl" />
            <h2 className="text-2xl font-bold">Secret Prophecies</h2>
            <Badge className="bg-accent-red/20 text-accent-red">Exclusive</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Unlock Hidden Content</h3>
              <p className="text-gray-300 mb-6">
                Access exclusive tracks, behind-the-scenes content, and prophetic messages from your favorite artists. 
                These hidden gems are only available to NFT holders and premium members.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse" />
                  <span>3 Prophecies unlocked</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-purple rounded-full animate-pulse" />
                  <span>7 Secret tracks available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse" />
                  <span>12 Exclusive NFTs waiting</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <img 
                src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400"
                alt="Mystical crystal formation with ethereal lighting"
                className="w-full h-40 object-cover rounded-lg"
              />
              <Button className="w-full bg-gradient-to-r from-accent-red to-accent-purple text-white hover:shadow-lg hover:shadow-red-500/30 transition-all">
                <Eye className="mr-2 w-4 h-4" />
                Explore Prophecies
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LyricsOverlay isOpen={showLyrics} onClose={() => setShowLyrics(false)} />
    </div>
  );
}
