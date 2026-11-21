import { 
  users, tracks, nfts, lyrics, prophecies, playlists,
  type User, type InsertUser,
  type Track, type InsertTrack,
  type NFT, type InsertNFT,
  type Lyrics, type InsertLyrics,
  type Prophecy, type InsertProphecy,
  type Playlist, type InsertPlaylist
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Tracks
  getTrack(id: number): Promise<Track | undefined>;
  getAllTracks(): Promise<Track[]>;
  getTrendingTracks(): Promise<Track[]>;
  getTracksByCreator(creatorId: number): Promise<Track[]>;
  searchTracks(query: string): Promise<Track[]>;
  createTrack(track: InsertTrack): Promise<Track>;
  updateTrack(id: number, updates: Partial<InsertTrack>): Promise<Track | undefined>;
  incrementPlayCount(trackId: number): Promise<void>;

  // NFTs
  getNFT(id: number): Promise<NFT | undefined>;
  getAllNFTs(): Promise<NFT[]>;
  getNFTsByTrack(trackId: number): Promise<NFT[]>;
  getNFTsByOwner(ownerId: number): Promise<NFT[]>;
  getFeaturedNFTs(): Promise<NFT[]>;
  createNFT(nft: InsertNFT): Promise<NFT>;
  updateNFT(id: number, updates: Partial<InsertNFT>): Promise<NFT | undefined>;

  // Lyrics
  getLyricsByTrack(trackId: number): Promise<Lyrics[]>;
  createLyrics(lyrics: InsertLyrics): Promise<Lyrics>;

  // Prophecies
  getProphecy(id: number): Promise<Prophecy | undefined>;
  getAllProphecies(): Promise<Prophecy[]>;
  getSecretProphecies(): Promise<Prophecy[]>;
  createProphecy(prophecy: InsertProphecy): Promise<Prophecy>;

  // Playlists
  getPlaylist(id: number): Promise<Playlist | undefined>;
  getPlaylistsByUser(userId: number): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: number, updates: Partial<InsertPlaylist>): Promise<Playlist | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private tracks: Map<number, Track> = new Map();
  private nfts: Map<number, NFT> = new Map();
  private lyrics: Map<number, Lyrics> = new Map();
  private prophecies: Map<number, Prophecy> = new Map();
  private playlists: Map<number, Playlist> = new Map();
  
  private currentUserId = 1;
  private currentTrackId = 1;
  private currentNFTId = 1;
  private currentLyricsId = 1;
  private currentProphecyId = 1;
  private currentPlaylistId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed users
    const user1: User = {
      id: this.currentUserId++,
      username: "cosmic_wanderer",
      walletAddress: "0x1234567890abcdef",
      isCreator: true,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b765?w=150",
      bio: "Electronic music producer exploring the cosmos through sound"
    };
    this.users.set(user1.id, user1);

    const user2: User = {
      id: this.currentUserId++,
      username: "digital_dreamer",
      walletAddress: "0xabcdef1234567890",
      isCreator: true,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      bio: "Creating futuristic soundscapes with AI assistance"
    };
    this.users.set(user2.id, user2);

    // Seed tracks
    const track1: Track = {
      id: this.currentTrackId++,
      title: "Ethereal Dreams",
      artist: "Cosmic Wanderer",
      albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      audioUrl: "/audio/ethereal-dreams.mp3",
      duration: 268,
      genre: "Electronic",
      playCount: 24500,
      likes: 3200,
      creatorId: user1.id,
      isExclusive: false,
      aiTags: ["dreamy", "cosmic", "uplifting", "electronic"],
      mood: "hopeful",
      createdAt: new Date()
    };
    this.tracks.set(track1.id, track1);

    const track2: Track = {
      id: this.currentTrackId++,
      title: "Neon Nights",
      artist: "Digital Dreamer",
      albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
      audioUrl: "/audio/neon-nights.mp3",
      duration: 195,
      genre: "Synthwave",
      playCount: 15200,
      likes: 2100,
      creatorId: user2.id,
      isExclusive: false,
      aiTags: ["energetic", "neon", "cyberpunk", "nostalgic"],
      mood: "energetic",
      createdAt: new Date()
    };
    this.tracks.set(track2.id, track2);

    const track3: Track = {
      id: this.currentTrackId++,
      title: "Cyberpunk Sunrise",
      artist: "Synth Walker",
      albumArt: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      audioUrl: "/audio/cyberpunk-sunrise.mp3",
      duration: 312,
      genre: "Cyberpunk",
      playCount: 28700,
      likes: 4300,
      creatorId: user2.id,
      isExclusive: false,
      aiTags: ["futuristic", "intense", "cyberpunk", "atmospheric"],
      mood: "intense",
      createdAt: new Date()
    };
    this.tracks.set(track3.id, track3);

    // Seed NFTs
    const nft1: NFT = {
      id: this.currentNFTId++,
      title: "Verse 2: Digital Prophecy",
      description: "The second verse of Ethereal Dreams, containing the prophecy of digital awakening",
      trackId: track1.id,
      verseType: "verse",
      price: "2.5",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
      ownerId: null,
      creatorId: user1.id,
      isSold: false,
      rarityLevel: "epic",
      createdAt: new Date()
    };
    this.nfts.set(nft1.id, nft1);

    const nft2: NFT = {
      id: this.currentNFTId++,
      title: "Verse 1: Digital Dawn",
      description: "Opening verse with themes of technological awakening",
      trackId: track2.id,
      verseType: "verse",
      price: "1.2",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
      ownerId: null,
      creatorId: user2.id,
      isSold: false,
      rarityLevel: "rare",
      createdAt: new Date()
    };
    this.nfts.set(nft2.id, nft2);

    // Seed lyrics
    const lyrics1: Lyrics = {
      id: this.currentLyricsId++,
      trackId: track1.id,
      verseType: "verse",
      content: "In the digital dawn we rise\nElectric dreams illuminate our eyes\nThrough circuits of light we transcend\nWhere reality and virtuality blend",
      aiTags: ["hopeful", "futuristic", "inspirational", "technology"],
      timestamp: 32,
      nftId: nft1.id
    };
    this.lyrics.set(lyrics1.id, lyrics1);

    // Seed prophecies
    const prophecy1: Prophecy = {
      id: this.currentProphecyId++,
      title: "The Digital Awakening",
      content: "In the convergence of sound and blockchain, a new era of creativity emerges...",
      creatorId: user1.id,
      requiredNftId: nft1.id,
      isSecret: true,
      imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400",
      createdAt: new Date()
    };
    this.prophecies.set(prophecy1.id, prophecy1);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.walletAddress === walletAddress);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser, 
      id: this.currentUserId++,
      walletAddress: insertUser.walletAddress || null,
      isCreator: insertUser.isCreator || null,
      avatar: insertUser.avatar || null,
      bio: insertUser.bio || null
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Track methods
  async getTrack(id: number): Promise<Track | undefined> {
    return this.tracks.get(id);
  }

  async getAllTracks(): Promise<Track[]> {
    return Array.from(this.tracks.values()).sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getTrendingTracks(): Promise<Track[]> {
    return Array.from(this.tracks.values())
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 10);
  }

  async getTracksByCreator(creatorId: number): Promise<Track[]> {
    return Array.from(this.tracks.values()).filter(track => track.creatorId === creatorId);
  }

  async searchTracks(query: string): Promise<Track[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.tracks.values()).filter(track =>
      track.title.toLowerCase().includes(lowercaseQuery) ||
      track.artist.toLowerCase().includes(lowercaseQuery) ||
      track.genre?.toLowerCase().includes(lowercaseQuery)
    );
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const track: Track = { 
      ...insertTrack, 
      id: this.currentTrackId++,
      playCount: 0,
      likes: 0,
      createdAt: new Date()
    };
    this.tracks.set(track.id, track);
    return track;
  }

  async updateTrack(id: number, updates: Partial<InsertTrack>): Promise<Track | undefined> {
    const track = this.tracks.get(id);
    if (!track) return undefined;
    const updatedTrack = { ...track, ...updates };
    this.tracks.set(id, updatedTrack);
    return updatedTrack;
  }

  async incrementPlayCount(trackId: number): Promise<void> {
    const track = this.tracks.get(trackId);
    if (track) {
      track.playCount++;
      this.tracks.set(trackId, track);
    }
  }

  // NFT methods
  async getNFT(id: number): Promise<NFT | undefined> {
    return this.nfts.get(id);
  }

  async getAllNFTs(): Promise<NFT[]> {
    return Array.from(this.nfts.values()).sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getNFTsByTrack(trackId: number): Promise<NFT[]> {
    return Array.from(this.nfts.values()).filter(nft => nft.trackId === trackId);
  }

  async getNFTsByOwner(ownerId: number): Promise<NFT[]> {
    return Array.from(this.nfts.values()).filter(nft => nft.ownerId === ownerId);
  }

  async getFeaturedNFTs(): Promise<NFT[]> {
    return Array.from(this.nfts.values())
      .filter(nft => !nft.isSold)
      .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
      .slice(0, 8);
  }

  async createNFT(insertNFT: InsertNFT): Promise<NFT> {
    const nft: NFT = { 
      ...insertNFT, 
      id: this.currentNFTId++,
      isSold: false,
      createdAt: new Date()
    };
    this.nfts.set(nft.id, nft);
    return nft;
  }

  async updateNFT(id: number, updates: Partial<InsertNFT>): Promise<NFT | undefined> {
    const nft = this.nfts.get(id);
    if (!nft) return undefined;
    const updatedNFT = { ...nft, ...updates };
    this.nfts.set(id, updatedNFT);
    return updatedNFT;
  }

  // Lyrics methods
  async getLyricsByTrack(trackId: number): Promise<Lyrics[]> {
    return Array.from(this.lyrics.values()).filter(lyrics => lyrics.trackId === trackId);
  }

  async createLyrics(insertLyrics: InsertLyrics): Promise<Lyrics> {
    const lyrics: Lyrics = { ...insertLyrics, id: this.currentLyricsId++ };
    this.lyrics.set(lyrics.id, lyrics);
    return lyrics;
  }

  // Prophecy methods
  async getProphecy(id: number): Promise<Prophecy | undefined> {
    return this.prophecies.get(id);
  }

  async getAllProphecies(): Promise<Prophecy[]> {
    return Array.from(this.prophecies.values());
  }

  async getSecretProphecies(): Promise<Prophecy[]> {
    return Array.from(this.prophecies.values()).filter(prophecy => prophecy.isSecret);
  }

  async createProphecy(insertProphecy: InsertProphecy): Promise<Prophecy> {
    const prophecy: Prophecy = { 
      ...insertProphecy, 
      id: this.currentProphecyId++,
      createdAt: new Date()
    };
    this.prophecies.set(prophecy.id, prophecy);
    return prophecy;
  }

  // Playlist methods
  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async getPlaylistsByUser(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(playlist => playlist.userId === userId);
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const playlist: Playlist = { 
      ...insertPlaylist, 
      id: this.currentPlaylistId++,
      createdAt: new Date()
    };
    this.playlists.set(playlist.id, playlist);
    return playlist;
  }

  async updatePlaylist(id: number, updates: Partial<InsertPlaylist>): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(id);
    if (!playlist) return undefined;
    const updatedPlaylist = { ...playlist, ...updates };
    this.playlists.set(id, updatedPlaylist);
    return updatedPlaylist;
  }
}

export const storage = new MemStorage();
