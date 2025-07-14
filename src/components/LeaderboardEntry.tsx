
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeaderboardUser } from '@/types/leaderboard';

interface LeaderboardEntryProps {
  user: LeaderboardUser;
  isCurrentUser?: boolean;
}

const LeaderboardEntry: React.FC<LeaderboardEntryProps> = ({ user, isCurrentUser = false }) => {
  // Function to determine rank badge color
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-700";
    return "text-gray-500";
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div 
      className={`flex items-center p-4 transition-colors ${
        isCurrentUser ? 'bg-lanka-gold/10 border-l-4 border-lanka-gold' : 'hover:bg-secondary/50'
      }`}
    >
      <div className="flex items-center justify-center w-8 h-8">
        <span className={`font-bold text-lg ${getRankColor(user.rank)}`}>
          {user.rank}
        </span>
      </div>
      
      <Avatar className="h-10 w-10 ml-2 mr-4 border border-secondary">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground">
          {user.locationsUnlocked} locations unlocked
        </p>
      </div>
      
      <div className="text-right">
        <p className="font-bold text-lanka-blue">{user.points}</p>
        <p className="text-xs text-muted-foreground">Points</p>
      </div>
    </div>
  );
};

export default LeaderboardEntry;
