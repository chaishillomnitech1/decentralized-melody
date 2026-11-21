import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  walletAddress: text("wallet_address").unique(),
  isCreator: boolean("is_creator").default(false),
  avatar: text("avatar"),
  bio: text("bio"),
});

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  albumArt: text("album_art"),
  audioUrl: text("audio_url"),
  duration: integer("duration"), // in seconds
  genre: text("genre"),
  playCount: integer("play_count").default(0),
  likes: integer("likes").default(0),
  creatorId: integer("creator_id").references(() => users.id),
  isExclusive: boolean("is_exclusive").default(false),
  aiTags: jsonb("ai_tags").$type<string[]>(),
  mood: text("mood"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  trackId: integer("track_id").references(() => tracks.id),
  verseType: text("verse_type"), // verse, chorus, bridge, outro
  price: decimal("price", { precision: 18, scale: 8 }), // ETH price
  imageUrl: text("image_url"),
  ownerId: integer("owner_id").references(() => users.id),
  creatorId: integer("creator_id").references(() => users.id),
  isSold: boolean("is_sold").default(false),
  rarityLevel: text("rarity_level"), // common, rare, epic, legendary
  createdAt: timestamp("created_at").defaultNow(),
});

export const lyrics = pgTable("lyrics", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").references(() => tracks.id),
  verseType: text("verse_type").notNull(),
  content: text("content").notNull(),
  aiTags: jsonb("ai_tags").$type<string[]>(),
  timestamp: integer("timestamp"), // position in track (seconds)
  nftId: integer("nft_id").references(() => nfts.id),
});

export const prophecies = pgTable("prophecies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  creatorId: integer("creator_id").references(() => users.id),
  requiredNftId: integer("required_nft_id").references(() => nfts.id),
  isSecret: boolean("is_secret").default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").references(() => users.id),
  trackIds: jsonb("track_ids").$type<number[]>().default([]),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
  playCount: true,
  likes: true,
  createdAt: true,
});

export const insertNFTSchema = createInsertSchema(nfts).omit({
  id: true,
  isSold: true,
  createdAt: true,
});

export const insertLyricsSchema = createInsertSchema(lyrics).omit({
  id: true,
});

export const insertProphecySchema = createInsertSchema(prophecies).omit({
  id: true,
  createdAt: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;

export type NFT = typeof nfts.$inferSelect;
export type InsertNFT = z.infer<typeof insertNFTSchema>;

export type Lyrics = typeof lyrics.$inferSelect;
export type InsertLyrics = z.infer<typeof insertLyricsSchema>;

export type Prophecy = typeof prophecies.$inferSelect;
export type InsertProphecy = z.infer<typeof insertProphecySchema>;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
