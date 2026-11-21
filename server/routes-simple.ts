import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-simple";

export async function registerRoutes(app: Express): Promise<Server> {
  // Track routes
  app.get("/api/tracks", async (req, res) => {
    const tracks = storage.getAllTracks();
    res.json(tracks);
  });

  app.get("/api/tracks/trending", async (req, res) => {
    const tracks = storage.getTrendingTracks();
    res.json(tracks);
  });

  app.get("/api/tracks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const track = storage.getTrack(id);
    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }
    res.json(track);
  });

  app.post("/api/tracks/:id/play", async (req, res) => {
    const id = parseInt(req.params.id);
    storage.incrementPlayCount(id);
    res.json({ success: true });
  });

  // NFT routes
  app.get("/api/nfts", async (req, res) => {
    const nfts = storage.getAllNFTs();
    res.json(nfts);
  });

  app.get("/api/nfts/featured", async (req, res) => {
    const nfts = storage.getFeaturedNFTs();
    res.json(nfts);
  });

  app.get("/api/nfts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const nft = storage.getNFT(id);
    if (!nft) {
      return res.status(404).json({ message: "NFT not found" });
    }
    res.json(nft);
  });

  app.post("/api/nfts/:id/buy", async (req, res) => {
    const id = parseInt(req.params.id);
    const nft = storage.buyNFT(id);
    if (!nft) {
      return res.status(404).json({ message: "NFT not found or already sold" });
    }
    res.json(nft);
  });

  // Wallet connection mock
  app.post("/api/wallet/connect", async (req, res) => {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address required" });
    }
    // Mock wallet connection
    res.json({
      id: 1,
      username: `user_${walletAddress.slice(-6)}`,
      walletAddress,
      isCreator: false
    });
  });

  // Creator stats mock
  app.get("/api/creators/:id/stats", async (req, res) => {
    res.json({
      totalPlays: "3.4K",
      nftsSold: "2",
      earnings: "1.7 ETH"
    });
  });

  // VibeCanvas integration mock
  app.post("/api/vibecanvas/sync", async (req, res) => {
    const { trackId } = req.body;
    res.json({ 
      success: true, 
      message: "Canvas synced with track",
      trackId,
      canvasUrl: `https://vibecanvas.app/sync/${trackId}`
    });
  });

  // Prophecies mock
  app.get("/api/prophecies", async (req, res) => {
    res.json([
      {
        id: 1,
        title: "The Digital Awakening",
        content: "In the convergence of sound and blockchain...",
        isSecret: true
      }
    ]);
  });

  const httpServer = createServer(app);
  return httpServer;
}