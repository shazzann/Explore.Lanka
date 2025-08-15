
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaderboardPodium from '@/components/leaderboard/LeaderboardPodium';
import LeaderboardList from '@/components/leaderboard/LeaderboardList';
import PlaceholderLeaderboard from '@/components/leaderboard/PlaceholderLeaderboard';
import { useLeaderboard } from '@/hooks/use-leaderboard';
import { Loader2 } from "lucide-react";
import { useQueryClient } from '@tanstack/react-query';

const Leaderboard = () => {
  const { currentTab, handleTabChange, leaderboardData, isLoading } = useLeaderboard();
  const { users, currentUser } = leaderboardData;
  const queryClient = useQueryClient();

  // Only show podium if we have at least 3 users and we're not loading
  const showPodium = !isLoading && users.length >= 3 && currentTab === 'overall';
  
  // Refetch leaderboard data when the component mounts
  useEffect(() => {
    // Invalidate the leaderboard query to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    
    // Log for debugging
    console.log("Leaderboard component mounted, refreshing data");
  }, [queryClient]);

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      
      <div className="flex-1 container px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground">
              See who's leading the exploration of Sri Lanka
            </p>
          </div>
        </div>
        
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overall" className="mt-0 space-y-6">
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-lanka-blue" />
              </div>
            )}
            
            {!isLoading && showPodium && (
              <LeaderboardPodium users={users.slice(0, 3)} />
            )}
            
            <LeaderboardList 
              isLoading={isLoading}
              users={users} 
              currentUser={currentUser}
            />
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-0 space-y-6">
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-lanka-blue" />
              </div>
            )}
            
            <LeaderboardList 
              isLoading={isLoading}
              users={users} 
              currentUser={currentUser}
            />
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-0 space-y-6">
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-lanka-blue" />
              </div>
            )}
            
            <LeaderboardList 
              isLoading={isLoading}
              users={users} 
              currentUser={currentUser}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;
