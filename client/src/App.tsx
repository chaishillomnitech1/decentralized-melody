import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AudioProvider } from "@/lib/audio-context";
import { Header } from "@/components/header";
import ScrollVerseFooter from "@/components/scrollverse-footer";
import { MusicPlayer } from "@/components/music-player";
import Home from "@/pages/home";
import NFTMarketplace from "@/pages/nft-marketplace";
import CreatorHub from "@/pages/creator-hub";
import Prophecies from "@/pages/prophecies";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/marketplace" component={NFTMarketplace} />
      <Route path="/creator" component={CreatorHub} />
      <Route path="/prophecies" component={Prophecies} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-dark-primary">
            <Header />
            <Router />
            <ScrollVerseFooter />
            <MusicPlayer />
            <Toaster />
          </div>
        </TooltipProvider>
      </AudioProvider>
    </QueryClientProvider>
  );
}

export default App;
