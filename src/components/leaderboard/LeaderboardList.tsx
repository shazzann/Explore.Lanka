import React, { useEffect } from 'react';
import { LeaderboardUser } from '@/types/leaderboard';
import LeaderboardEntry from '@/components/LeaderboardEntry';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Trophy } from "lucide-react";

interface LeaderboardListProps {
  isLoading: boolean;
  users: LeaderboardUser[];
  currentUser: LeaderboardUser | null;
}

const LeaderboardList: React.FC<LeaderboardListProps> = ({ 
  isLoading, users, currentUser 
}) => {
  // Log when the component receives new data
  useEffect(() => {
    console.log("LeaderboardList received new data:", { 
      usersCount: users.length,
      currentUser: currentUser?.name
    });
  }, [users, currentUser]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center p-4 rounded-lg gradient-card border border-border/50">
            <Skeleton className="h-8 w-8 rounded-full mr-2" />
            <Skeleton className="h-10 w-10 rounded-full mr-4" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-5 w-12 ml-auto" />
              <Skeleton className="h-3 w-8 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter out any duplicate entries to ensure clean display
  const uniqueUsers = users.filter((user, index, self) => 
    index === self.findIndex((u) => u.id === user.id)
  );
  
  // Sort users by points in descending order
  const sortedUsers = [...uniqueUsers].sort((a, b) => b.points - a.points);
  
  // Update ranks based on the sorted order
  const rankedUsers = sortedUsers.map((user, index) => ({
    ...user,
    rank: index + 1
  }));

  // Display message if no data available
  if (!rankedUsers || rankedUsers.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No Rankings Yet"
        description="Be the first to unlock locations and climb the leaderboard!"
      />
    );
  }

  return (
    <div className="gradient-card rounded-lg border border-border/50 shadow-elegant animate-fade-in">
      <div className="p-4 border-b border-border/30">
        <h3 className="font-semibold text-lg">Top Explorers</h3>
      </div>
      
      <div className="p-2 space-y-2">
        {rankedUsers.map((leaderboardUser) => (
          <LeaderboardEntry 
            key={leaderboardUser.id}
            user={leaderboardUser}
            isCurrentUser={currentUser?.id === leaderboardUser.id}
          />
        ))}
        
        {/* Current user if not in top users */}
        {currentUser && !rankedUsers.some(u => u.id === currentUser.id) && (
          <>
            <div className="py-2 px-4 text-center text-sm text-muted-foreground">
              • • •
            </div>
            <LeaderboardEntry 
              user={currentUser}
              isCurrentUser={true}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardList;