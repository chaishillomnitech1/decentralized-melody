import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Lock, Unlock, Search, Gem, Sparkles, Crown, Zap } from "lucide-react";
import type { Prophecy } from "@shared/schema";

export default function Prophecies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProphecy, setSelectedProphecy] = useState<Prophecy | null>(null);
  const [unlockedProphecies, setUnlockedProphecies] = useState<number[]>([1]); // Mock unlocked prophecy

  const { data: prophecies, isLoading } = useQuery<Prophecy[]>({
    queryKey: ["/api/prophecies"],
  });

  const { data: secretProphecies } = useQuery<Prophecy[]>({
    queryKey: ["/api/prophecies/secret"],
  });

  const filteredProphecies = prophecies?.filter(prophecy =>
    prophecy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prophecy.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleUnlockProphecy = (prophecyId: number) => {
    // Mock unlock functionality - in real app this would require NFT verification
    setUnlockedProphecies(prev => [...prev, prophecyId]);
  };

  const isUnlocked = (prophecyId: number) => unlockedProphecies.includes(prophecyId);

  return (
    <div className="min-h-screen bg-dark-primary text-white pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-accent-red/20 via-accent-purple/20 to-accent-cyan/20 rounded-2xl p-8 border border-accent-red/30">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-accent-red to-accent-purple rounded-full flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-red to-accent-purple bg-clip-text text-transparent">
                  Secret Prophecies
                </h1>
                <p className="text-gray-300 text-lg">
                  Unlock exclusive content and hidden messages from visionary artists
                </p>
              </div>
              <Badge className="bg-accent-red/20 text-accent-red text-lg px-4 py-2">
                Exclusive
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <Unlock className="w-6 h-6 text-accent-green" />
                <div>
                  <p className="font-semibold text-accent-green">{unlockedProphecies.length}</p>
                  <p className="text-sm text-gray-400">Prophecies Unlocked</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Gem className="w-6 h-6 text-accent-cyan" />
                <div>
                  <p className="font-semibold text-accent-cyan">{secretProphecies?.length || 7}</p>
                  <p className="text-sm text-gray-400">Secret Tracks Available</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Crown className="w-6 h-6 text-accent-amber" />
                <div>
                  <p className="font-semibold text-accent-amber">12</p>
                  <p className="text-sm text-gray-400">Exclusive NFTs Waiting</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search prophecies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-dark-secondary border-gray-800 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Access Levels */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Unlock className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-semibold text-green-400">Public Access</p>
                  <p className="text-sm text-gray-300">Available to all users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 border-accent-purple/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Gem className="w-6 h-6 text-accent-purple" />
                <div>
                  <p className="font-semibold text-accent-purple">NFT Holders</p>
                  <p className="text-sm text-gray-300">Requires specific NFT ownership</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent-red/20 to-accent-amber/20 border-accent-red/30">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Crown className="w-6 h-6 text-accent-red" />
                <div>
                  <p className="font-semibold text-accent-red">Legendary Access</p>
                  <p className="text-sm text-gray-300">Ultra-rare prophecies</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prophecies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-dark-secondary border-gray-800 animate-pulse">
                <CardContent className="p-6">
                  <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-700 h-4 rounded mb-2"></div>
                  <div className="bg-gray-700 h-3 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Prophecy */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Sparkles className="w-6 h-6 mr-3 text-accent-amber" />
                Featured Prophecy
              </h2>
              <Card className="bg-gradient-to-br from-accent-amber/10 to-accent-red/10 border border-accent-amber/30 hover:border-accent-amber/60 transition-all">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <img
                        src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=500"
                        alt="The Digital Awakening prophecy visualization"
                        className="w-full h-64 object-cover rounded-xl shadow-2xl"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                        <Crown className="w-6 h-6 text-accent-amber" />
                        <Badge className="bg-accent-amber/20 text-accent-amber">Legendary</Badge>
                        {isUnlocked(1) ? (
                          <Badge className="bg-green-500/20 text-green-400">
                            <Unlock className="w-3 h-3 mr-1" />
                            Unlocked
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-400">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold mb-4">The Digital Awakening</h3>
                      {isUnlocked(1) ? (
                        <p className="text-gray-300 mb-6 leading-relaxed">
                          "In the convergence of sound and blockchain, a new era of creativity emerges. 
                          The barriers between artist and audience dissolve, replaced by direct connection 
                          through immutable art. Each note becomes a token, each verse a prophecy of the 
                          decentralized future we're building together..."
                        </p>
                      ) : (
                        <p className="text-gray-400 mb-6 italic">
                          This prophecy contains sacred knowledge about the future of music and blockchain. 
                          Unlock it by owning the "Digital Prophecy" NFT from Ethereal Dreams.
                        </p>
                      )}
                      <div className="flex items-center space-x-4">
                        {isUnlocked(1) ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="gradient-amber-red">
                                <Eye className="w-4 h-4 mr-2" />
                                Read Full Prophecy
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-dark-secondary border-accent-amber/30 max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-2xl flex items-center">
                                  <Crown className="w-6 h-6 mr-3 text-accent-amber" />
                                  The Digital Awakening
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <img
                                  src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600"
                                  alt="Full prophecy visualization"
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                                <div className="prose prose-invert max-w-none">
                                  <p className="text-gray-300 leading-relaxed">
                                    In the convergence of sound and blockchain, a new era of creativity emerges. 
                                    The barriers between artist and audience dissolve, replaced by direct connection 
                                    through immutable art. Each note becomes a token, each verse a prophecy of the 
                                    decentralized future we're building together.
                                  </p>
                                  <p className="text-gray-300 leading-relaxed">
                                    The old gatekeepers fall silent as creators claim their sovereignty. 
                                    In this realm where code meets consciousness, music transcends mere entertainment 
                                    to become a living, breathing ecosystem of value and meaning.
                                  </p>
                                  <p className="text-gray-300 leading-relaxed">
                                    Listen closely to the frequencies between the beats - there you'll find 
                                    the blueprint for tomorrow's creative economy, written in the language 
                                    of digital dreams and crystallized in the amber of eternal blockchain.
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Button 
                            className="bg-accent-amber text-dark-primary hover:bg-accent-amber/80"
                            onClick={() => handleUnlockProphecy(1)}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Unlock with NFT
                          </Button>
                        )}
                        <p className="text-sm text-gray-400">
                          Requires: "Digital Prophecy" NFT
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* All Prophecies */}
            <section>
              <h2 className="text-2xl font-bold mb-6">All Prophecies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mock prophecies since we need to show the interface */}
                <Card className="bg-dark-secondary border-gray-800 hover:border-accent-purple/30 transition-all group">
                  <CardContent className="p-6">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300"
                        alt="Neural prophecy visualization"
                        className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <Badge className="bg-accent-purple/20 text-accent-purple">NFT Required</Badge>
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">The Neural Symphony</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      A prophecy about AI-human collaboration in music creation...
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Requires: AI Verse NFT</p>
                      <Button size="sm" variant="outline" className="border-accent-purple text-accent-purple">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-dark-secondary border-gray-800 hover:border-accent-cyan/30 transition-all group">
                  <CardContent className="p-6">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=300"
                        alt="Quantum harmony visualization"
                        className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <Badge className="bg-accent-cyan/20 text-accent-cyan">Public</Badge>
                        <Unlock className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">Quantum Harmonies</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      The mathematics of music revealed through quantum mechanics...
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Free access</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-accent-cyan text-dark-primary">
                            <Eye className="w-3 h-3 mr-1" />
                            Read
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-dark-secondary border-accent-cyan/30">
                          <DialogHeader>
                            <DialogTitle>Quantum Harmonies</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-gray-300">
                              In the quantum realm, every note exists in superposition until observed by consciousness. 
                              Music becomes not just art, but a fundamental force that shapes reality itself...
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-dark-secondary border-gray-800 hover:border-accent-red/30 transition-all group">
                  <CardContent className="p-6">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300"
                        alt="Ethereal realms visualization"
                        className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <Badge className="bg-accent-red/20 text-accent-red">Legendary</Badge>
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">The Ethereal Realms</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Beyond the physical lies a dimension where music takes form...
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Requires: Ethereal NFT</p>
                      <Button size="sm" variant="outline" className="border-accent-red text-accent-red">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Unlock Instructions */}
            <section className="bg-dark-secondary rounded-xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold mb-6">How to Unlock Prophecies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Gem className="w-5 h-5 mr-2 text-accent-purple" />
                    NFT-Gated Content
                  </h3>
                  <div className="space-y-3 text-gray-300">
                    <p>• Purchase specific NFTs from the marketplace</p>
                    <p>• Each prophecy requires a unique NFT key</p>
                    <p>• NFT ownership is verified automatically</p>
                    <p>• Access remains permanent while you hold the NFT</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-accent-amber" />
                    Legendary Access
                  </h3>
                  <div className="space-y-3 text-gray-300">
                    <p>• Collect complete NFT sets from an artist</p>
                    <p>• Participate in exclusive community events</p>
                    <p>• Early supporters receive special privileges</p>
                    <p>• Some prophecies unlock based on total collection value</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
