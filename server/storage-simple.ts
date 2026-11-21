export interface Track {
  id: number;
  title: string;
  artist: string;
  audioUrl: string;
  duration: number;
  playCount: number;
  likes: number;
  albumArt?: string;
  genre?: string;
}

export interface NFT {
  id: number;
  title: string;
  description: string;
  trackId: number;
  price: string;
  imageUrl?: string;
  isSold: boolean;
  rarityLevel: string;
}

export class SimpleStorage {
  private tracks: Track[] = [
    {
      id: 1,
      title: "Keep It Real",
      artist: "ScrollVerse",
      audioUrl: "/audio/keep-it-real.mp3",
      duration: 240,
      playCount: 1250,
      likes: 89,
      albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      genre: "Hip-Hop"
    },
    {
      id: 2,
      title: "Throwing Stones",
      artist: "ScrollVerse",
      audioUrl: "/audio/throwing-stones.mp3", 
      duration: 210,
      playCount: 980,
      likes: 67,
      albumArt: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      genre: "Alternative"
    },
    {
      id: 3,
      title: "Legendary",
      artist: "ScrollVerse",
      audioUrl: "/audio/legendary.mp3",
      duration: 195,
      playCount: 2100,
      likes: 156,
      albumArt: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
      genre: "Electronic"
    }
  ];

  private nfts: NFT[] = [
    {
      id: 1,
      title: "Keep It Real - Verse 1",
      description: "First verse NFT from Keep It Real",
      trackId: 1,
      price: "0.5",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300",
      isSold: false,
      rarityLevel: "rare"
    },
    {
      id: 2,
      title: "Legendary - Chorus",
      description: "Epic chorus section from Legendary",
      trackId: 3,
      price: "1.2",
      imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300",
      isSold: false,
      rarityLevel: "epic"
    }
  ];

  getAllTracks(): Track[] {
    return this.tracks;
  }

  getTrendingTracks(): Track[] {
    return this.tracks.sort((a, b) => b.playCount - a.playCount);
  }

  getTrack(id: number): Track | undefined {
    return this.tracks.find(track => track.id === id);
  }

  incrementPlayCount(trackId: number): void {
    const track = this.tracks.find(t => t.id === trackId);
    if (track) {
      track.playCount++;
    }
  }

  getAllNFTs(): NFT[] {
    return this.nfts;
  }

  getFeaturedNFTs(): NFT[] {
    return this.nfts.filter(nft => !nft.isSold);
  }

  getNFT(id: number): NFT | undefined {
    return this.nfts.find(nft => nft.id === id);
  }

  buyNFT(id: number): NFT | undefined {
    const nft = this.nfts.find(n => n.id === id);
    if (nft && !nft.isSold) {
      nft.isSold = true;
      return nft;
    }
    return undefined;
  }
}

export const storage = new SimpleStorage();