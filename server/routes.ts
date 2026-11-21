import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTrackSchema, 
  insertNFTSchema, 
  insertUserSchema,
  insertLyricsSchema,
  insertProphecySchema,
  insertPlaylistSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.post("/api/wallet/connect", async (req, res) => {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address required" });
    }

    let user = await storage.getUserByWallet(walletAddress);
    if (!user) {
      // Create new user with wallet
      user = await storage.createUser({
        username: `user_${walletAddress.slice(-6)}`,
        walletAddress,
        isCreator: false
      });
    }
    res.json(user);
  });

  // Track routes
  app.get("/api/tracks", async (req, res) => {
    const tracks = await storage.getAllTracks();
    res.json(tracks);
  });

  app.get("/api/tracks/trending", async (req, res) => {
    const tracks = await storage.getTrendingTracks();
    res.json(tracks);
  });

  app.get("/api/tracks/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query required" });
    }
    const tracks = await storage.searchTracks(query);
    res.json(tracks);
  });

  app.get("/api/tracks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const track = await storage.getTrack(id);
    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }
    res.json(track);
  });

  app.post("/api/tracks", async (req, res) => {
    try {
      const trackData = insertTrackSchema.parse(req.body);
      const track = await storage.createTrack(trackData);
      res.status(201).json(track);
    } catch (error) {
      res.status(400).json({ message: "Invalid track data", error });
    }
  });

  app.post("/api/tracks/:id/play", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.incrementPlayCount(id);
    res.json({ success: true });
  });

  app.get("/api/tracks/:id/lyrics", async (req, res) => {
    const trackId = parseInt(req.params.id);
    const lyrics = await storage.getLyricsByTrack(trackId);
    res.json(lyrics);
  });

  // NFT routes
  app.get("/api/nfts", async (req, res) => {
    const nfts = await storage.getAllNFTs();
    res.json(nfts);
  });

  app.get("/api/nfts/featured", async (req, res) => {
    const nfts = await storage.getFeaturedNFTs();
    res.json(nfts);
  });

  app.get("/api/nfts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const nft = await storage.getNFT(id);
    if (!nft) {
      return res.status(404).json({ message: "NFT not found" });
    }
    res.json(nft);
  });

  app.get("/api/tracks/:trackId/nfts", async (req, res) => {
    const trackId = parseInt(req.params.trackId);
    const nfts = await storage.getNFTsByTrack(trackId);
    res.json(nfts);
  });

  app.post("/api/nfts", async (req, res) => {
    try {
      const nftData = insertNFTSchema.parse(req.body);
      const nft = await storage.createNFT(nftData);
      res.status(201).json(nft);
    } catch (error) {
      res.status(400).json({ message: "Invalid NFT data", error });
    }
  });

  app.post("/api/nfts/:id/buy", async (req, res) => {
    const id = parseInt(req.params.id);
    const { buyerId } = req.body;
    
    const nft = await storage.updateNFT(id, { 
      ownerId: buyerId, 
      isSold: true 
    });
    
    if (!nft) {
      return res.status(404).json({ message: "NFT not found" });
    }
    res.json(nft);
  });

  // Prophecy routes
  app.get("/api/prophecies", async (req, res) => {
    const prophecies = await storage.getAllProphecies();
    res.json(prophecies);
  });

  app.get("/api/prophecies/secret", async (req, res) => {
    const prophecies = await storage.getSecretProphecies();
    res.json(prophecies);
  });

  app.post("/api/prophecies", async (req, res) => {
    try {
      const prophecyData = insertProphecySchema.parse(req.body);
      const prophecy = await storage.createProphecy(prophecyData);
      res.status(201).json(prophecy);
    } catch (error) {
      res.status(400).json({ message: "Invalid prophecy data", error });
    }
  });

  // Creator routes
  app.get("/api/creators/:id/tracks", async (req, res) => {
    const creatorId = parseInt(req.params.id);
    const tracks = await storage.getTracksByCreator(creatorId);
    res.json(tracks);
  });

  app.get("/api/creators/:id/stats", async (req, res) => {
    const creatorId = parseInt(req.params.id);
    const tracks = await storage.getTracksByCreator(creatorId);
    const nfts = await storage.getAllNFTs();
    
    const totalPlays = tracks.reduce((sum, track) => sum + (track.playCount || 0), 0);
    const soldNFTs = nfts.filter(nft => nft.creatorId === creatorId && nft.isSold);
    const totalEarnings = soldNFTs.reduce((sum, nft) => sum + parseFloat(nft.price || "0"), 0);

    res.json({
      totalPlays: totalPlays.toLocaleString(),
      nftsSold: soldNFTs.length,
      earnings: `${totalEarnings.toFixed(1)} ETH`
    });
  });

  // VibeCanvas integration mock
  app.post("/api/vibecanvas/sync", async (req, res) => {
    const { trackId, canvasData } = req.body;
    // Mock VibeCanvas integration
    res.json({ 
      success: true, 
      message: "Canvas synced with track",
      trackId,
      canvasUrl: `https://vibecanvas.app/sync/${trackId}`
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
