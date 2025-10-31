import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { GameSidebar } from "./GameSidebar";
import { WordleGame } from "./WordleGame";
import { useState, useEffect } from "react";

interface GameSettings {
  wordLength: number;
  maxGuesses: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const GameLayout = () => {
  const [settings, setSettings] = useState<GameSettings>({
    wordLength: 5,
    maxGuesses: 6,
    difficulty: 'medium'
  });

  const [gameKey, setGameKey] = useState(0); // Force game reset when settings change

  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
    setGameKey(prev => prev + 1); // Force WordleGame to remount with new settings
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <GameSidebar 
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
        
        <main className="flex-1 relative">
          <WordleGame key={gameKey} settings={settings} />
          <FloatingSidebarTrigger />
        </main>
      </div>
    </SidebarProvider>
  );
};

const FloatingSidebarTrigger = () => {
  const { open, openMobile, isMobile } = useSidebar();
  const isOpen = isMobile ? openMobile : open;

  if (isOpen) return null;

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40">
      <SidebarTrigger
        className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        aria-label="Open Menu"
        title="Open Menu"
      />
    </div>
  );
};