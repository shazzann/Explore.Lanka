import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import { LeaderboardUser } from '@/types/leaderboard';

interface LeaderboardPodiumProps {
  users: LeaderboardUser[];
}

const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({ users }) => {
  if (users.length < 3) return null;
  
  const getInitials = (name: string) => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="flex justify-center items-end space-x-4 mb-8 px-4 animate-fade-in">
      {/* 2nd Place */}
      <div className="flex flex-col items-center hover-lift">
        <div className="gradient-card rounded-lg p-4 w-24 h-32 flex flex-col justify-end items-center mb-2 border-2 border-silver shadow-[0_0_8px_hsl(var(--silver)/0.6)]">
          <Avatar className="h-12 w-12 mb-2 border-2 border-silver">
            {users[1].avatar && <AvatarImage src={users[1].avatar} alt={users[1].name} />}
            <AvatarFallback className="bg-slate-200 text-slate-600 font-semibold">
              {getInitials(users[1].name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-xl font-bold text-slate-400">2</div>
        </div>
        <p className="font-medium text-sm text-center">{users[1].name}</p>
        <p className="text-xs text-muted-foreground">{users[1].points} pts</p>
      </div>

      {/* 1st Place */}
      <div className="flex flex-col items-center hover-lift">
        <div className="gradient-primary rounded-lg p-4 w-28 h-36 flex flex-col justify-end items-center mb-2 border-2 border-gold shadow-[0_0_8px_hsl(var(--gold)/0.8)]">
          <Avatar className="h-14 w-14 mb-2 border-2 border-gold">
            {users[0].avatar && <AvatarImage src={users[0].avatar} alt={users[0].name} />}
            <AvatarFallback className="bg-primary-foreground text-primary font-semibold">
              {getInitials(users[0].name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-2xl font-bold text-primary-foreground">1</div>
        </div>
        <p className="font-semibold text-center">{users[0].name}</p>
        <p className="text-sm text-primary font-medium">{users[0].points} pts</p>
      </div>

      {/* 3rd Place */}
      <div className="flex flex-col items-center hover-lift">
        <div className="gradient-card rounded-lg p-4 w-20 h-28 flex flex-col justify-end items-center mb-2 border-2 border-bronze shadow-[0_0_8px_hsl(var(--bronze)/0.5)]">
          <Avatar className="h-10 w-10 mb-2 border-2 border-bronze">
            {users[2].avatar && <AvatarImage src={users[2].avatar} alt={users[2].name} />}
            <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
              {getInitials(users[2].name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-lg font-bold text-orange-500">3</div>
        </div>
        <p className="font-medium text-sm text-center">{users[2].name}</p>
        <p className="text-xs text-muted-foreground">{users[2].points} pts</p>
      </div>
    </div>
  );
};

export default LeaderboardPodium;