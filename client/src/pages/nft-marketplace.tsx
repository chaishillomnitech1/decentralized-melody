import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NFTCard } from "@/components/nft-card";
import { Search, Filter, SortAsc } from "lucide-react";
import type { NFT } from "@shared/schema";

export default function NFTMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [tradeOffer, setTradeOffer] = useState("");
  const [tradeAsk, setTradeAsk] = useState("");
  const [tradeMsg, setTradeMsg] = useState("");
  const handleTrade = async () => {
    setTradeMsg("Working...");
    try {
      const r = await fetch("/api/demo/trade", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ offerItem: tradeOffer, askItem: tradeAsk }) });
      const j = await r.json();
      if (!r.ok) { setTradeMsg(j.error || ("Failed (" + r.status + ")")); return; }
      setTradeMsg("Trade offer recorded in the ledger: " + (j.ledgerId || "") + " — " + tradeOffer + " for " + tradeAsk);
    } catch (e) { setTradeMsg("Request failed: " + String(e)); }
  };

  const { data: allNFTs, isLoading } = useQuery<NFT[]>({
    queryKey: ["/api/nfts"],
  });

  const filteredNFTs = allNFTs?.filter(nft => {
    const matchesSearch = nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nft.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === "all" || 
                         (filterBy === "available" && !nft.isSold) ||
                         (filterBy === "sold" && nft.isSold) ||
                         nft.verseType === filterBy ||
                         nft.rarityLevel === filterBy;

    return matchesSearch && matchesFilter;
  }) || [];

  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "newest":
        return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
      case "oldest":
        return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-dark-primary text-white pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent-purple to-accent-cyan bg-clip-text text-transparent">
            NFT Marketplace
          </h1>
          <p className="text-gray-400 text-lg">
            Discover and collect exclusive verse-based NFTs from your favorite artists
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search NFTs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-dark-secondary border-gray-800 text-white placeholder-gray-400"
            />
          </div>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="bg-dark-secondary border-gray-800">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent className="bg-dark-secondary border-gray-800">
              <SelectItem value="all">All NFTs</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="verse">Verses</SelectItem>
              <SelectItem value="chorus">Choruses</SelectItem>
              <SelectItem value="bridge">Bridges</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-dark-secondary border-gray-800">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="bg-dark-secondary border-gray-800">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
            </SelectContent>
          </Select>

          <Button className="gradient-purple-cyan">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-secondary rounded-lg p-4 border border-gray-800">
            <p className="text-sm text-gray-400">Total NFTs</p>
            <p className="text-2xl font-bold text-accent-purple">{allNFTs?.length || 0}</p>
          </div>
          <div className="bg-dark-secondary rounded-lg p-4 border border-gray-800">
            <p className="text-sm text-gray-400">Available</p>
            <p className="text-2xl font-bold text-accent-cyan">
              {allNFTs?.filter(nft => !nft.isSold).length || 0}
            </p>
          </div>
          <div className="bg-dark-secondary rounded-lg p-4 border border-gray-800">
            <p className="text-sm text-gray-400">Floor Price</p>
            <p className="text-2xl font-bold text-accent-amber">
              {allNFTs?.filter(nft => !nft.isSold).reduce((min, nft) => 
                Math.min(min, parseFloat(nft.price)), Infinity
              ).toFixed(1) || "0"} ETH
            </p>
          </div>
          <div className="bg-dark-secondary rounded-lg p-4 border border-gray-800">
            <p className="text-sm text-gray-400">Volume</p>
            <p className="text-2xl font-bold text-accent-red">124.5 ETH</p>
          </div>
        </div>

        {/* NFT Grid */}
        {/* Demo trade offers */}
        <div className="mb-8 bg-dark-secondary border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Demo Trade Offers (test mode)</h2>
          <p className="text-sm text-gray-400 mb-4">Offer one of your NFTs in trade for another. Demo only: no real NFT is moved. Every offer is recorded in the app ledger.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="NFT you offer, e.g. Verse 1: Digital Dawn" value={tradeOffer} onChange={(e) => setTradeOffer(e.target.value)} className="bg-dark-secondary border-gray-800 text-white placeholder-gray-400" />
            <Input placeholder="NFT you want, e.g. Ethereal Dreams" value={tradeAsk} onChange={(e) => setTradeAsk(e.target.value)} className="bg-dark-secondary border-gray-800 text-white placeholder-gray-400" />
            <Button onClick={handleTrade}>Make trade offer (demo)</Button>
          </div>
          {tradeMsg && <p className="text-sm text-gray-300 mt-4">{tradeMsg}</p>}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-dark-secondary rounded-xl p-4 animate-pulse">
                <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-700 h-4 rounded mb-2"></div>
                <div className="bg-gray-700 h-3 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-700 h-6 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : sortedNFTs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-dark-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setFilterBy("all");
                setSortBy("newest");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedNFTs.map((nft) => (
              <NFTCard key={nft.id} nft={nft} size="md" />
            ))}
          </div>
      </>
        )}

        {/* Featured Collections */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 rounded-xl p-6 border border-accent-purple/30">
              <h3 className="text-xl font-semibold mb-2">Ethereal Dreams Collection</h3>
              <p className="text-gray-400 mb-4">Complete verse collection from Cosmic Wanderer's hit track</p>
              <div className="flex justify-between items-center">
                <span className="text-accent-purple font-bold">5 NFTs</span>
                <Button size="sm" className="bg-accent-purple">View Collection</Button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-accent-cyan/20 to-accent-amber/20 rounded-xl p-6 border border-accent-cyan/30">
              <h3 className="text-xl font-semibold mb-2">Cyberpunk Series</h3>
              <p className="text-gray-400 mb-4">Futuristic soundscapes with exclusive visual art</p>
              <div className="flex justify-between items-center">
                <span className="text-accent-cyan font-bold">8 NFTs</span>
                <Button size="sm" className="bg-accent-cyan text-dark-primary">View Collection</Button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-accent-amber/20 to-accent-red/20 rounded-xl p-6 border border-accent-amber/30">
              <h3 className="text-xl font-semibold mb-2">Digital Prophecies</h3>
              <p className="text-gray-400 mb-4">Rare prophetic verses with hidden meanings</p>
              <div className="flex justify-between items-center">
                <span className="text-accent-amber font-bold">3 NFTs</span>
                <Button size="sm" className="bg-accent-amber text-dark-primary">View Collection</Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
