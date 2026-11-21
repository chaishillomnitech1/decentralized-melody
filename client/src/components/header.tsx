import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Search, Wallet } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const connectWalletMutation = useMutation({
    mutationFn: async () => {
      // Simulate wallet connection
      const walletAddress = "0x" + Math.random().toString(16).substr(2, 40);
      return await apiRequest("POST", "/api/wallet/connect", { walletAddress });
    },
    onSuccess: async (response) => {
      const user = await response.json();
      setIsConnected(true);
      toast({
        title: "Wallet Connected",
        description: `Connected as ${user.username}`,
      });
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isActive = (path: string) => location === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-secondary/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 gradient-purple-cyan rounded-lg flex items-center justify-center">
                <Music className="text-white text-xl" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                VibeChain
              </h1>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <button className={`pb-1 transition-colors ${
                isActive("/") ? "text-accent-purple border-b-2 border-accent-purple" : "text-gray-400 hover:text-accent-purple"
              }`}>
                Discover
              </button>
            </Link>
            <Link href="/marketplace">
              <button className={`pb-1 transition-colors ${
                isActive("/marketplace") ? "text-accent-purple border-b-2 border-accent-purple" : "text-gray-400 hover:text-accent-purple"
              }`}>
                NFTs
              </button>
            </Link>
            <Link href="/creator">
              <button className={`pb-1 transition-colors ${
                isActive("/creator") ? "text-accent-purple border-b-2 border-accent-purple" : "text-gray-400 hover:text-accent-purple"
              }`}>
                Creator Hub
              </button>
            </Link>
            <Link href="/prophecies">
              <button className={`pb-1 transition-colors ${
                isActive("/prophecies") ? "text-accent-purple border-b-2 border-accent-purple" : "text-gray-400 hover:text-accent-purple"
              }`}>
                Prophecies
              </button>
            </Link>
          </nav>

          {/* Search and Wallet */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-dark-tertiary rounded-lg px-3 py-2">
              <Search className="text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search tracks, artists..."
                className="bg-transparent border-none text-white placeholder-gray-400 outline-none w-48 p-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              className={`gradient-purple-cyan font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all ${
                isConnected ? "bg-green-600 hover:bg-green-700" : ""
              }`}
              onClick={() => connectWalletMutation.mutate()}
              disabled={connectWalletMutation.isPending}
            >
              <Wallet className="mr-2 w-4 h-4" />
              {connectWalletMutation.isPending
                ? "Connecting..."
                : isConnected
                ? "Connected"
                : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
