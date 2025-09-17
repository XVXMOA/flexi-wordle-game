import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
          {/* Always visible trigger in the header */}
          <div className="absolute top-4 left-4 z-10">
            <SidebarTrigger />
          </div>
          
          <WordleGame key={gameKey} settings={settings} />
        </main>
      </div>
    </SidebarProvider>
  );
};