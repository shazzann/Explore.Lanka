
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import { LeaderboardUser } from '@/types/leaderboard';

interface LeaderboardPodiumProps {
  users: LeaderboardUser[];
}

const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({ users }) => {
  if (users.length < 3) return null;
  
  // Sample avatar images for top users if they don't have one
  const ensureAvatar = (user: LeaderboardUser, index: number) => {
    if (user.avatar && !user.avatar.includes('dicebear')) return user.avatar;
    
    // Fallback avatars for top 3
    if (index === 0) return "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?q=80&w=1376&auto=format&fit=crop";
    if (index === 1) return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374&auto=format&fit=crop";
    if (index === 2) return "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1374&auto=format&fit=crop";
    
    // Generic fallback
    return user.avatar;
  };

  return (
    <div className="leaderboard-podium hidden md:flex justify-center items-end mb-8 h-64">
      {/* 2nd place */}
      <div className="leaderboard-position second-place flex flex-col items-center mx-4">
        <div className="leaderboard-avatar mb-2 relative">
          <Avatar className="h-16 w-16 border-4 border-lanka-gold shadow-lg">
            <AvatarImage src={ensureAvatar(users[1], 1)} alt={users[1]?.name} />
            <AvatarFallback>{users[1]?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="leaderboard-rank bg-lanka-gold text-white h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold absolute -bottom-1 -right-1">
            2
          </div>
        </div>
        <div className="leaderboard-podium-base bg-lanka-gold/80 h-32 w-24 rounded-t-lg"></div>
        <p className="mt-2 font-medium text-sm">{users[1]?.name}</p>
        <p className="text-sm text-lanka-blue font-bold">{users[1]?.points} pts</p>
      </div>
      
      {/* 1st place */}
      <div className="leaderboard-position first-place flex flex-col items-center mx-4 relative">
        <Trophy className="absolute -top-10 text-lanka-gold h-8 w-8" />
        <div className="leaderboard-avatar mb-2 relative">
          <Avatar className="h-20 w-20 border-4 border-lanka-gold shadow-lg">
            <AvatarImage src={ensureAvatar(users[0], 0)} alt={users[0]?.name} />
            <AvatarFallback>{users[0]?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="leaderboard-rank bg-lanka-gold text-white h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold absolute -bottom-1 -right-1">
            1
          </div>
        </div>
        <div className="leaderboard-podium-base bg-lanka-gold h-40 w-24 rounded-t-lg"></div>
        <p className="mt-2 font-medium">{users[0]?.name}</p>
        <p className="text-lanka-blue font-bold">{users[0]?.points} pts</p>
      </div>
      
      {/* 3rd place */}
      <div className="leaderboard-position third-place flex flex-col items-center mx-4">
        <div className="leaderboard-avatar mb-2 relative">
          <Avatar className="h-14 w-14 border-3 border-lanka-gold shadow-lg">
            <AvatarImage src={ensureAvatar(users[2], 2)} alt={users[2]?.name} />
            <AvatarFallback>{users[2]?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="leaderboard-rank bg-lanka-gold text-white h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold absolute -bottom-1 -right-1">
            3
          </div>
        </div>
        <div className="leaderboard-podium-base bg-lanka-gold/60 h-24 w-24 rounded-t-lg"></div>
        <p className="mt-2 font-medium text-sm">{users[2]?.name}</p>
        <p className="text-sm text-lanka-blue font-bold">{users[2]?.points} pts</p>
      </div>
    </div>
  );
};

export default LeaderboardPodium;
