
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeaderboardUser } from '@/types/leaderboard';

interface LeaderboardEntryProps {
  user: LeaderboardUser;
  isCurrentUser?: boolean;
}

const LeaderboardEntry: React.FC<LeaderboardEntryProps> = ({ user, isCurrentUser = false }) => {
  // Function to determine rank badge color using design system
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-slate-400";
    if (rank === 3) return "text-amber-600";
    return "text-muted-foreground";
  };

  const getInitials = (name: string) => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div 
      className={`flex items-center p-4 rounded-lg mb-2 hover-lift animate-fade-in ${
        isCurrentUser 
          ? 'bg-primary/10 border border-primary/20 shadow-elegant' 
          : 'gradient-card border border-border/50 hover:shadow-card'
      }`}
    >
      <div className="flex items-center justify-center w-8 h-8">
        <span className={`font-bold text-lg ${getRankColor(user.rank)}`}>
          {user.rank}
        </span>
      </div>
      
      <Avatar className="h-10 w-10 ml-2 mr-4 border border-secondary">
        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground">
          {user.locationsUnlocked} locations unlocked
        </p>
      </div>
      
      <div className="text-right">
        <p className="font-bold text-primary text-lg">{user.points}</p>
        <p className="text-xs text-muted-foreground">Points</p>
      </div>
    </div>
  );
};

export default LeaderboardEntry;
