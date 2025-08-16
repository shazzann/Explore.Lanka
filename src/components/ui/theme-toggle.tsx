import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Initialize theme on component mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Default to dark mode for new users if no saved preference
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && (prefersDark || true));
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      // Set dark mode as default for new users
      if (!savedTheme) {
        localStorage.setItem('theme', 'dark');
      }
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'relative h-9 w-9 rounded-md border border-border/50',
        'hover:bg-secondary/80 hover:border-border',
        'transition-all duration-300 hover-lift'
      )}
    >
      <Sun 
        className={cn(
          'h-4 w-4 transition-all duration-300',
          isDark ? 'scale-0 rotate-90' : 'scale-100 rotate-0'
        )} 
      />
      <Moon 
        className={cn(
          'absolute h-4 w-4 transition-all duration-300',
          isDark ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
        )} 
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export { ThemeToggle };