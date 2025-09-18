import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
  SidebarTrigger,
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
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Settings</h2>
        <SidebarTrigger className="h-7 w-7" />
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2">Game</SidebarGroupLabel>
          
          <SidebarGroupContent className="space-y-6">
            <div className="space-y-2">
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
              <p className="text-xs text-muted-foreground">Letters per word</p>
            </div>

            <div className="space-y-2">
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
              <p className="text-xs text-muted-foreground">Attempts allowed</p>
            </div>

            <div className="space-y-2">
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
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Word complexity</p>
            </div>

            <div className="pt-4 space-y-2 border-t">
              <Button onClick={handleSave} className="w-full">Apply</Button>
              <Button variant="outline" onClick={handleReset} className="w-full">Reset</Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};