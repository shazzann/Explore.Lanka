import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import UserNav from './UserNav';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navItems = [
  { name: 'Explore Game', href: '/game' },
  { name: 'Trip Planner', href: '/planner' },
  { name: 'AI Assistant', href: '/assistant' },
  { name: 'Photo Feed', href: '/photos' },
  { name: 'Leaderboard', href: '/leaderboard' },
];

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="font-bold text-2xl">
          Explore<span className="text-lanka-blue">.Lanka</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href} className="text-sm font-medium hover:text-gray-600">
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <UserNav />
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
          
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:w-2/3 md:w-1/2 lg:w-1/3">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Explore Lanka
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                {navItems.map((item) => (
                  <Link key={item.href} to={item.href} className="text-sm font-medium hover:text-gray-600 block py-2">
                    {item.name}
                  </Link>
                ))}
                
                {!user && (
                  <Link to="/auth">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
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
