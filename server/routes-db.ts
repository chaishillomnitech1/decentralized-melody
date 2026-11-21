import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-db";
import { storage as previewStorage } from "./storage";
import { createPaymentIntent, handleSuccessfulPayment } from "./payment";

function isMissingTableError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "42P01"
  );
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Track routes
  app.get("/api/tracks", async (req, res) => {
    try {
      const tracks = await storage.getAllTracks();
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tracks" });
    }
  });

  app.get("/api/tracks/trending", async (req, res) => {
    try {
      const tracks = await storage.getTrendingTracks();
      res.json(tracks);
    } catch (error) {
      if (
        process.env.NODE_ENV === "development" &&
        isMissingTableError(error)
      ) {
        console.warn(
          "Database tracks table is missing; serving seeded preview tracks.",
        );
        return res.json(await previewStorage.getTrendingTracks());
      }
      res.status(500).json({ error: "Failed to fetch trending tracks" });
    }
  });

  app.get("/api/tracks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const track = await storage.getTrack(id);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      res.json(track);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch track" });
    }
  });

  app.post("/api/tracks/:id/play", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.incrementPlayCount(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update play count" });
    }
  });

  // NFT routes
  app.get("/api/nfts", async (req, res) => {
    try {
      const nfts = await storage.getAllNFTs();
      res.json(nfts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NFTs" });
    }
  });

  app.get("/api/nfts/featured", async (req, res) => {
    try {
      const nfts = await storage.getFeaturedNFTs();
      res.json(nfts);
    } catch (error) {
      if (
        process.env.NODE_ENV === "development" &&
        isMissingTableError(error)
      ) {
        console.warn(
          "Database NFTs table is missing; serving seeded preview NFTs.",
        );
        return res.json(await previewStorage.getFeaturedNFTs());
      }
      res.status(500).json({ error: "Failed to fetch featured NFTs" });
    }
  });

  app.get("/api/nfts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const nft = await storage.getNFT(id);
      if (!nft) {
        return res.status(404).json({ message: "NFT not found" });
      }
      res.json(nft);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch NFT" });
    }
  });

  // Payment routes
  app.post("/api/payment/create-intent", async (req, res) => {
    try {
      const { amount, itemType, itemId, userId } = req.body;

      const paymentIntent = await createPaymentIntent(amount, "usd", {
        itemType,
        itemId: itemId.toString(),
        userId: userId?.toString(),
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error) {
      console.error("Payment intent creation failed:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  app.post("/api/payment/confirm", async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      const result = await handleSuccessfulPayment(paymentIntentId);
      res.json(result);
    } catch (error) {
      console.error("Payment confirmation failed:", error);
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  // Webhook for Stripe
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const { type, data } = req.body;

      if (type === "payment_intent.succeeded") {
        await handleSuccessfulPayment(data.object.id);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook processing failed:", error);
      res.status(400).json({ error: "Webhook processing failed" });
    }
  });

  // User routes
  app.post("/api/wallet/connect", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address required" });
      }

      let user = await storage.getUserByWallet(walletAddress);
      if (!user) {
        user = await storage.createUser({
          username: `user_${walletAddress.slice(-6)}`,
          walletAddress,
          isCreator: false,
        });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to connect wallet" });
    }
  });

  // Creator stats
  app.get("/api/creators/:id/stats", async (req, res) => {
    try {
      // Real stats from database would go here
      res.json({
        totalPlays: "3.4K",
        nftsSold: "2",
        earnings: "1.7 ETH",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch creator stats" });
    }
  });

  // VibeCanvas integration
  app.post("/api/vibecanvas/sync", async (req, res) => {
    const { trackId } = req.body;
    res.json({
      success: true,
      message: "Canvas synced with track",
      trackId,
      canvasUrl: `https://vibecanvas.app/sync/${trackId}`,
    });
  });

  // Prophecies
  app.get("/api/prophecies", async (req, res) => {
    res.json([
      {
        id: 1,
        title: "The Digital Awakening",
        content: "In the convergence of sound and blockchain...",
        isSecret: true,
      },
    ]);
  });

  const httpServer = createServer(app);
  return httpServer;
}
