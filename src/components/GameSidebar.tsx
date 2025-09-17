import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Target } from "lucide-react";
import { useState } from "react";

interface GameSettings {
  wordLength: number;
  maxGuesses: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GameSidebarProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
}

export const GameSidebar = ({ settings, onSettingsChange }: GameSidebarProps) => {
  const { setOpen } = useSidebar();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    setOpen(false);
  };

  const handleReset = () => {
    const defaultSettings = {
      wordLength: 5,
      maxGuesses: 6,
      difficulty: 'medium' as const,
    };
    setLocalSettings(defaultSettings);
  };

  return (
    <Sidebar className="w-80 border-r">
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Wordle+ Settings</h2>
            <p className="text-sm text-muted-foreground">Customize your game</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-6">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center space-x-2 mb-4">
            <Settings className="w-4 h-4" />
            <span>Game Configuration</span>
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="word-length" className="text-sm font-medium">
                Word Length
              </Label>
              <Select
                value={localSettings.wordLength.toString()}
                onValueChange={(value) =>
                  setLocalSettings(prev => ({ ...prev, wordLength: parseInt(value) }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7, 8].map((length) => (
                    <SelectItem key={length} value={length.toString()}>
                      {length} letters
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose how many letters each word contains
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="max-guesses" className="text-sm font-medium">
                Number of Guesses
              </Label>
              <Select
                value={localSettings.maxGuesses.toString()}
                onValueChange={(value) =>
                  setLocalSettings(prev => ({ ...prev, maxGuesses: parseInt(value) }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7, 8, 9, 10].map((guesses) => (
                    <SelectItem key={guesses} value={guesses.toString()}>
                      {guesses} guesses
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How many attempts you get to solve each word
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="difficulty" className="text-sm font-medium">
                Difficulty Level
              </Label>
              <Select
                value={localSettings.difficulty}
                onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                  setLocalSettings(prev => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">
                    <div className="flex flex-col items-start">
                      <span>Easy</span>
                      <span className="text-xs text-muted-foreground">Common words</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex flex-col items-start">
                      <span>Medium</span>
                      <span className="text-xs text-muted-foreground">Mixed difficulty</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="hard">
                    <div className="flex flex-col items-start">
                      <span>Hard</span>
                      <span className="text-xs text-muted-foreground">Challenging words</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Controls word complexity and rarity
              </p>
            </div>

            <div className="pt-6 space-y-3 border-t">
              <Button 
                onClick={handleSave} 
                className="w-full"
                size="lg"
              >
                Apply Settings
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="w-full"
              >
                Reset to Default
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};