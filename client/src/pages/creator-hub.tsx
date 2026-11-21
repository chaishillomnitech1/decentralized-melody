import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackCard } from "@/components/track-card";
import { Upload, TrendingUp, Bot, Zap, DollarSign, Music2, BarChart3 } from "lucide-react";
import type { Track } from "@shared/schema";

export default function CreatorHub() {
  const [uploadData, setUploadData] = useState({
    title: "",
    artist: "",
    genre: "",
    description: "",
    price: ""
  });
  const [demoTitle, setDemoTitle] = useState("");
  const [demoPrice, setDemoPrice] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoMsg, setDemoMsg] = useState("");
  const demoCall = async (path: string, body: Record<string, unknown>) => {
    setDemoMsg("Working...");
    try {
      const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok) { setDemoMsg(j.error || ("Failed (" + r.status + ")")); return; }
      setDemoMsg("Recorded in the ledger: " + (j.ledgerId || "") + " — " + JSON.stringify(j.nft || j.listing || j));
    } catch (e) { setDemoMsg("Request failed: " + String(e)); }
  };

  const { data: userTracks } = useQuery<Track[]>({
    queryKey: ["/api/creators/1/tracks"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/creators/1/stats"],
  });

  const handleUpload = () => {
    // Mock upload functionality
    console.log("Uploading track:", uploadData);
  };

  return (
    <div className="min-h-screen bg-dark-primary text-white pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent-purple to-accent-cyan bg-clip-text text-transparent">
            Creator Hub
          </h1>
          <p className="text-gray-400 text-lg">
            Upload your music, create NFTs, and monetize your art on the blockchain
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-secondary border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Plays</p>
                  <p className="text-2xl font-bold text-accent-purple">{stats?.totalPlays || "124.5K"}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">NFTs Sold</p>
                  <p className="text-2xl font-bold text-accent-cyan">{stats?.nftsSold || "47"}</p>
                </div>
                <Zap className="w-8 h-8 text-accent-cyan" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Earnings</p>
                  <p className="text-2xl font-bold text-accent-amber">{stats?.earnings || "23.8 ETH"}</p>
                </div>
                <DollarSign className="w-8 h-8 text-accent-amber" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Tracks</p>
                  <p className="text-2xl font-bold text-accent-red">{userTracks?.length || "12"}</p>
                </div>
                <Music2 className="w-8 h-8 text-accent-red" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upload" className="space-y-8">
          <TabsList className="bg-dark-secondary border-gray-800">
            <TabsTrigger value="upload" className="data-[state=active]:bg-accent-purple">
              <Upload className="w-4 h-4 mr-2" />
              Upload Track
            </TabsTrigger>
            <TabsTrigger value="tracks" className="data-[state=active]:bg-accent-cyan">
              <Music2 className="w-4 h-4 mr-2" />
              My Tracks
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-accent-amber">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className="data-[state=active]:bg-accent-red">
              <Bot className="w-4 h-4 mr-2" />
              AI Tools
            </TabsTrigger>
      <TabsTrigger value="demo-mint" className="data-[state=active]:bg-accent-green">Demo Mint &amp; List</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-dark-secondary border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Upload New Track</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Track Title</Label>
                    <Input
                      placeholder="Enter track title..."
                      value={uploadData.title}
                      onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                      className="bg-dark-tertiary border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Artist Name</Label>
                    <Input
                      placeholder="Your artist name..."
                      value={uploadData.artist}
                      onChange={(e) => setUploadData({...uploadData, artist: e.target.value})}
                      className="bg-dark-tertiary border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Genre</Label>
                    <Select value={uploadData.genre} onValueChange={(value) => setUploadData({...uploadData, genre: value})}>
                      <SelectTrigger className="bg-dark-tertiary border-gray-700">
                        <SelectValue placeholder="Select genre..." />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-secondary border-gray-800">
                        <SelectItem value="electronic">Electronic</SelectItem>
                        <SelectItem value="ambient">Ambient</SelectItem>
                        <SelectItem value="synthwave">Synthwave</SelectItem>
                        <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                        <SelectItem value="experimental">Experimental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your track..."
                      value={uploadData.description}
                      onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                      className="bg-dark-tertiary border-gray-700 min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Starting NFT Price (ETH)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="1.0"
                      value={uploadData.price}
                      onChange={(e) => setUploadData({...uploadData, price: e.target.value})}
                      className="bg-dark-tertiary border-gray-700"
                    />
                  </div>

                  <Button onClick={handleUpload} className="w-full gradient-purple-cyan">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Track & Create NFTs
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-gray-800">
                <CardHeader>
                  <CardTitle>Upload Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-accent-purple flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-semibold">Audio Analysis</p>
                        <p className="text-sm text-gray-400">AI analyzes your track structure and emotions</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-accent-cyan flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-semibold">Verse Segmentation</p>
                        <p className="text-sm text-gray-400">Automatic identification of verses, chorus, and bridges</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-accent-amber flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-semibold">NFT Generation</p>
                        <p className="text-sm text-gray-400">Each segment becomes a unique, tradeable NFT</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-accent-red flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <div>
                        <p className="font-semibold">Blockchain Deployment</p>
                        <p className="text-sm text-gray-400">NFTs are minted and listed on the marketplace</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-accent-purple/10 rounded-lg border border-accent-purple/30">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-accent-purple" />
                      Pro Tip
                    </h4>
                    <p className="text-sm text-gray-300">
                      Tracks with clear emotional progression and distinct sections perform better as NFT collections.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Tracks Tab */}
          <TabsContent value="tracks">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Your Tracks</h2>
                <Button className="gradient-purple-cyan">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Track
                </Button>
              </div>

              {userTracks?.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-dark-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Music2 className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No tracks uploaded yet</h3>
                  <p className="text-gray-400 mb-4">Start by uploading your first track to begin earning</p>
                  <Button className="gradient-purple-cyan">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your First Track
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userTracks?.map((track) => (
                    <TrackCard key={track.id} track={track} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-dark-secondary border-gray-800">
                  <CardHeader>
                    <CardTitle>Revenue Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border border-gray-700 rounded-lg">
                      <p className="text-gray-400">Chart visualization would go here</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-dark-secondary border-gray-800">
                  <CardHeader>
                    <CardTitle>Top Performing Tracks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-dark-tertiary rounded-lg">
                        <span>Ethereal Dreams</span>
                        <span className="text-accent-purple font-bold">24.5K plays</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-dark-tertiary rounded-lg">
                        <span>Neon Nights</span>
                        <span className="text-accent-cyan font-bold">15.2K plays</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-dark-tertiary rounded-lg">
                        <span>Cosmic Voyage</span>
                        <span className="text-accent-amber font-bold">12.8K plays</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Tools Tab */}
          <TabsContent value="ai-tools">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">AI Enhancement Tools</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-dark-secondary border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-accent-purple" />
                      <span>Lyrics Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">
                      AI-powered sentiment analysis and mood detection for your lyrics
                    </p>
                    <Button className="w-full bg-accent-purple hover:bg-accent-purple/80">
                      Analyze Lyrics
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-dark-secondary border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-accent-cyan" />
                      <span>Auto-Tagging</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">
                      Automatically generate genre tags and mood descriptors
                    </p>
                    <Button className="w-full bg-accent-cyan text-dark-primary hover:bg-accent-cyan/80">
                      Generate Tags
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-dark-secondary border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-accent-amber" />
                      <span>Market Prediction</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">
                      AI suggests optimal NFT pricing based on track analysis
                    </p>
                    <Button className="w-full bg-accent-amber text-dark-primary hover:bg-accent-amber/80">
                      Get Pricing
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
  <TabsContent value="demo-mint">
    <Card className="bg-dark-secondary border-gray-800">
      <CardHeader>
        <CardTitle>Demo Mint &amp; List (test mode)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-400">Mint a test NFT and list it for sale. Demo only: nothing is minted on-chain and no real NFT is moved. Every action is recorded in the app ledger.</p>
        <div>
          <Label htmlFor="demo-title">Title</Label>
          <Input id="demo-title" value={demoTitle} onChange={(e) => setDemoTitle(e.target.value)} placeholder="Test Verse" />
        </div>
        <div>
          <Label htmlFor="demo-price">Price (USD)</Label>
          <Input id="demo-price" value={demoPrice} onChange={(e) => setDemoPrice(e.target.value)} placeholder="0.5" />
        </div>
        <div>
          <Label htmlFor="demo-email">Seller email (optional, for the ledger)</Label>
          <Input id="demo-email" value={demoEmail} onChange={(e) => setDemoEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => demoCall("/api/demo/mint", { title: demoTitle, price: Number(demoPrice) })}>Demo mint</Button>
          <Button variant="outline" onClick={() => demoCall("/api/demo/list", { title: demoTitle, price: Number(demoPrice), currency: "USD", sellerEmail: demoEmail || undefined })}>List for sale (demo)</Button>
        </div>
        {demoMsg && <p className="text-sm text-gray-300">{demoMsg}</p>}
      </CardContent>
    </Card>
  </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
