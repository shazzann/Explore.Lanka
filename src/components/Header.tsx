import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import UserNav from './UserNav';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home } from "lucide-react";

const navItems = [
  { name: 'Explore Game', href: '/game' },
  { name: 'Trip Planner', href: '/planner' },
  { name: 'AI Assistant', href: '/assistant' },
  { name: 'Photo Feed', href: '/photos' },
  { name: 'Leaderboard', href: '/leaderboard' },
];

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-elegant">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex">
          <Link to="/" className="mr-6 flex items-center space-x-2 hover-lift">
            <span className="font-bold text-xl text-foreground">
              Explore<span className="text-primary">.Lanka</span>
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center space-x-8 mx-6">
          {!isHomePage && (
            <Link to="/" className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors hover-lift">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          )}
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              to={item.href} 
              className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          {user ? (
            <UserNav />
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="hover-lift">
                Sign In
              </Button>
            </Link>
          )}
          
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="hover-lift">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">Navigation</SheetTitle>
                <SheetDescription className="text-left">
                  Explore Sri Lanka with us
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-6 py-6">
                {!isHomePage && (
                  <Link 
                    to="/" 
                    className="flex items-center space-x-3 text-base font-medium hover:text-primary py-3 border-b border-border/50 transition-colors"
                  >
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                )}
                
                <div className="space-y-4">
                  {navItems.map((item) => (
                    <Link 
                      key={item.href} 
                      to={item.href} 
                      className="flex items-center text-base font-medium hover:text-primary py-2 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                
                {!user && (
                  <div className="pt-4 border-t border-border/50">
                    <Link to="/auth">
                      <Button variant="outline" size="lg" className="w-full hover-lift">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
