
import React from 'react';
import { Medal, Star } from "lucide-react";

interface PlaceholderLeaderboardProps {
  type: 'weekly' | 'monthly';
}

const PlaceholderLeaderboard: React.FC<PlaceholderLeaderboardProps> = ({ type }) => {
  const Icon = type === 'weekly' ? Medal : Star;
  const title = type === 'weekly' ? 'Weekly' : 'Monthly';
  
  return (
    <div className="flex flex-col items-center justify-center h-60 bg-secondary/20 rounded-lg border border-dashed">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{title} leaderboard coming soon</p>
      <p className="text-xs text-muted-foreground mt-2">
        Check back {type === 'weekly' ? 'next week' : 'next month'}!
      </p>
    </div>
  );
};

export default PlaceholderLeaderboard;
