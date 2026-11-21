import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gem, Zap } from "lucide-react";
import { PaymentModal } from "./payment-modal";
import type { NFT } from "@shared/schema";

interface NFTCardProps {
  nft: NFT;
  size?: "sm" | "md" | "lg";
}

export function NFTCard({ nft, size = "md" }: NFTCardProps) {
  const [showPayment, setShowPayment] = useState(false);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "accent-amber";
      case "epic": return "accent-purple";
      case "rare": return "accent-cyan";
      default: return "gray-400";
    }
  };

  const sizeClasses = {
    sm: "p-3",
    md: "p-4", 
    lg: "p-6"
  };

  const imageSizeClasses = {
    sm: "h-24",
    md: "h-32",
    lg: "h-48"
  };

  return (
    <div className={`bg-gradient-to-br from-dark-secondary to-dark-tertiary rounded-xl ${sizeClasses[size]} border border-${getRarityColor(nft.rarityLevel || "common")}/30 hover:border-${getRarityColor(nft.rarityLevel || "common")}/60 transition-all hover:shadow-lg hover:shadow-${getRarityColor(nft.rarityLevel || "common")}/20`}>
      <div className="relative">
        <img 
          src={nft.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300"}
          alt={nft.title}
          className={`w-full ${imageSizeClasses[size]} object-cover rounded-lg mb-4`}
        />
        <Badge 
          className={`absolute top-2 right-2 bg-${getRarityColor(nft.rarityLevel || "common")}/20 text-${getRarityColor(nft.rarityLevel || "common")}`}
        >
          {nft.rarityLevel}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <h4 className={`font-semibold ${size === "lg" ? "text-lg" : "text-sm"} text-white`}>
          {nft.title}
        </h4>
        {nft.description && size === "lg" && (
          <p className="text-xs text-gray-400">{nft.description}</p>
        )}
        <p className="text-xs text-gray-400">
          {nft.verseType?.charAt(0).toUpperCase() + nft.verseType?.slice(1)} NFT
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Gem className="w-3 h-3 text-accent-cyan" />
            <span className={`text-accent-cyan font-bold ${size === "lg" ? "text-base" : "text-sm"}`}>
              {nft.price} ETH
            </span>
          </div>
          
          {!nft.isSold ? (
            <Button
              size={size === "lg" ? "default" : "sm"}
              className={`bg-${getRarityColor(nft.rarityLevel || "common")} text-white hover:bg-${getRarityColor(nft.rarityLevel || "common")}/80 transition-colors`}
              onClick={() => setShowPayment(true)}
            >
              <Zap className="w-3 h-3 mr-1" />
              Buy Now
            </Button>
          ) : (
            <Badge variant="secondary" className="bg-green-600/20 text-green-400">
              Sold
            </Badge>
          )}
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          nft={{
            id: nft.id,
            title: nft.title,
            price: String(nft.price),
            imageUrl: nft.imageUrl || "",
            artist: (nft as any).artist || "VibeChain",
          }}
        />
        </div>
      </div>
    </div>
  );
}
