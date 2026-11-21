import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users, tracks, nfts } from "../shared/schema";
import { eq, desc } from "drizzle-orm";
import type { Track, NFT, User } from "../shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export class DatabaseStorage {
  // Track methods
  async getAllTracks(): Promise<Track[]> {
    return await db.select().from(tracks).orderBy(desc(tracks.createdAt));
  }
  async getTrendingTracks(): Promise<Track[]> {
    return await db.select().from(tracks).orderBy(desc(tracks.playCount)).limit(10);
  }

  async getTrack(id: number): Promise<Track | undefined> {
    const result = await db.select().from(tracks).where(eq(tracks.id, id));
    return result[0];
  }

  async incrementPlayCount(trackId: number): Promise<void> {
    const track = await this.getTrack(trackId);
    if (track) {
      await db.update(tracks)
        .set({ playCount: (track.playCount || 0) + 1 })
        .where(eq(tracks.id, trackId));
    }
  }

  // NFT methods
  async getAllNFTs(): Promise<NFT[]> {
    return await db.select().from(nfts).orderBy(desc(nfts.createdAt));
  }

  async getFeaturedNFTs(): Promise<NFT[]> {
    return await db.select().from(nfts).where(eq(nfts.isSold, false)).limit(6);
  }

  async getNFT(id: number): Promise<NFT | undefined> {
    const result = await db.select().from(nfts).where(eq(nfts.id, id));
    return result[0];
  }

  async buyNFT(id: number, buyerId: number): Promise<NFT | undefined> {
    const result = await db.update(nfts)
      .set({ isSold: true, ownerId: buyerId })
      .where(eq(nfts.id, id))
      .returning();
    return result[0];
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return result[0];
  }

  async createUser(userData: { username: string; walletAddress?: string; isCreator?: boolean }): Promise<User> {
    const result = await db.insert(users).values({
      username: userData.username,
      walletAddress: userData.walletAddress || null,
      isCreator: userData.isCreator || false
    }).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();