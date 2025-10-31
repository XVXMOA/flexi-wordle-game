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
    <Sidebar className="glass-sidebar">
      <SidebarHeader className="px-6 pt-8 pb-4">
        <div className="liquid-panel-soft flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600">
          <span className="flex items-center gap-2 text-slate-700">
            <Settings className="h-4 w-4" />
            Game setup
          </span>
          <SidebarTrigger className="h-7 w-7" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-6 pb-8">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="mb-4 px-0 text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-500">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Flow Controls
            </span>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <div className="liquid-panel-soft space-y-6 rounded-2xl px-5 py-6 text-slate-600">
              <div className="space-y-2">
                <Label htmlFor="word-length" className="text-sm font-medium text-slate-700">
                  Word Length
                </Label>
                <Select
                  value={localSettings.wordLength.toString()}
                  onValueChange={(value) =>
                    setLocalSettings(prev => ({ ...prev, wordLength: parseInt(value) }))
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border-white/40 bg-white/60 text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm bg-white/80">
                    {[3, 4, 5, 6, 7, 8].map((length) => (
                      <SelectItem key={length} value={length.toString()}>
                        {length} letters
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Letters per word</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-guesses" className="text-sm font-medium text-slate-700">
                  Number of Guesses
                </Label>
                <Select
                  value={localSettings.maxGuesses.toString()}
                  onValueChange={(value) =>
                    setLocalSettings(prev => ({ ...prev, maxGuesses: parseInt(value) }))
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border-white/40 bg-white/60 text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm bg-white/80">
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((guesses) => (
                      <SelectItem key={guesses} value={guesses.toString()}>
                        {guesses} guesses
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Attempts allowed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty" className="text-sm font-medium text-slate-700">
                  Difficulty Level
                </Label>
                <Select
                  value={localSettings.difficulty}
                  onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                    setLocalSettings(prev => ({ ...prev, difficulty: value }))
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border-white/40 bg-white/60 text-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm bg-white/80">
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Word complexity</p>
              </div>

              <div className="grid gap-2 pt-2 text-sm font-medium">
                <Button onClick={handleSave} className="w-full rounded-full bg-slate-900/90 text-white hover:bg-slate-900">
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full rounded-full border-slate-300/50 bg-white/70 text-slate-600 hover:bg-white"
                >
                  Reset
                </Button>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};