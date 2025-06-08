'use client';

import * as React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Theme</h3>
      <ToggleGroup 
        type="single" 
        value={theme} 
        onValueChange={(value) => {
          if (value) setTheme(value);
        }}
        className="justify-start"
      >
        <ToggleGroupItem value="light" aria-label="Light theme">
          <Sun className="h-4 w-4 mr-2" />
          Light
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" aria-label="Dark theme">
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </ToggleGroupItem>
        <ToggleGroupItem value="system" aria-label="System theme">
          <Monitor className="h-4 w-4 mr-2" />
          System
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
} 