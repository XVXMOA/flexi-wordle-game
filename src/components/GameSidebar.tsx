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
import type { WordCategory } from "@/lib/wordApi";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GameSettings {
  wordLength: number;
  maxGuesses: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: WordCategory;
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
    const defaultSettings: GameSettings = {
      wordLength: 5,
      maxGuesses: 6,
      difficulty: 'medium' as const,
      category: 'normal',
    };
    setLocalSettings(defaultSettings);
  };

  return (
    <Sidebar className="bg-white text-slate-700 shadow-sm dark:bg-slate-900/95 dark:text-slate-200">
      <SidebarHeader className="border-b border-slate-200 px-6 pt-8 pb-4 dark:border-slate-800">
        <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
          <span className="flex items-center gap-2">
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
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white px-5 py-6 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200">
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
                  <SelectTrigger className="w-full rounded-xl border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800">
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
                  <SelectTrigger className="w-full rounded-xl border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800">
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
                  <SelectTrigger className="w-full rounded-xl border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800">
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Word complexity</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Word Theme</Label>
                <Tabs
                  value={localSettings.category}
                  onValueChange={(value) =>
                    setLocalSettings(prev => ({ ...prev, category: value as WordCategory }))
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/60">
                    <TabsTrigger
                      value="normal"
                      className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100"
                    >
                      Normal
                    </TabsTrigger>
                    <TabsTrigger
                      value="brainrot"
                      className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100"
                    >
                      Brainrot
                    </TabsTrigger>
                    <TabsTrigger
                      value="famous"
                      className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100"
                    >
                      Famous
                    </TabsTrigger>
                    <TabsTrigger
                      value="games"
                      className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100"
                    >
                      Games
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <p className="text-xs text-slate-500">Choose the vocabulary pool</p>
              </div>

              <div className="grid gap-2 pt-2 text-sm font-medium">
                <Button onClick={handleSave} className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full rounded-full border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
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