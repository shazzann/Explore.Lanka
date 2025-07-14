
import React, { useEffect } from 'react';
import { LeaderboardUser } from '@/types/leaderboard';
import LeaderboardEntry from '@/components/LeaderboardEntry';
import { Loader2 } from "lucide-react";

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
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-lanka-blue" />
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

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <h3 className="font-medium">Top Explorers</h3>
      </div>
      
      {rankedUsers.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No data available yet. Be the first on the leaderboard!</p>
        </div>
      ) : (
        <div className="divide-y">
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
      )}
    </div>
  );
};

export default LeaderboardList;
