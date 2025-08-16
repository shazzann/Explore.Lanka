
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Loader2, Eye, RotateCcw, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface UsersTableProps {
  users: any[];
}

const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch user's unlocked locations
  const { data: userLocations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['user-locations', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return [];
      
      const { data, error } = await supabase
        .from('user_locations')
        .select(`
          location_id,
          points_earned,
          unlocked_at,
          locations (
            name,
            region,
            category
          )
        `)
        .eq('user_id', selectedUserId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedUserId,
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('delete_user_account', {
        user_id_param: userId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'User deleted',
        description: 'User account and all associated data have been permanently deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion failed',
        description: error.message || 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const resetUserStatsMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Delete all user locations (this will trigger the function to update profile stats)
      const { error: deleteError } = await supabase
        .from('user_locations')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) throw deleteError;

      // Reset profile points and places_unlocked to 0
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          points: 0, 
          places_unlocked: 0 
        })
        .eq('id', userId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-locations'] });
      toast({
        title: 'User stats reset',
        description: 'User points and unlocked places have been reset to zero.',
      });
      window.location.reload(); // Refresh to show updated data
    },
    onError: (error: any) => {
      toast({
        title: 'Reset failed',
        description: error.message || 'Failed to reset user stats. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Places Unlocked</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user: any) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.points}</TableCell>
              <TableCell>{user.places_unlocked}</TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {/* View Unlocked Places Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {user.username}'s Unlocked Places
                        </DialogTitle>
                        <DialogDescription>
                          Places that {user.username} has unlocked and points earned
                        </DialogDescription>
                      </DialogHeader>
                      <div className="max-h-96 overflow-y-auto">
                        {isLoadingLocations ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : userLocations.length === 0 ? (
                          <p className="text-center py-8 text-muted-foreground">
                            No unlocked places yet
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {userLocations.map((userLocation: any) => (
                              <div key={userLocation.location_id} className="flex items-center justify-between border rounded-lg p-4">
                                <div>
                                  <h4 className="font-medium">{userLocation.locations.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {userLocation.locations.region} • {userLocation.locations.category}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Unlocked: {new Date(userLocation.unlocked_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge variant="secondary">
                                  {userLocation.points_earned} pts
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Reset Stats Dialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={resetUserStatsMutation.isPending}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset User Stats</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reset {user.username}'s stats? This will:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Set their points to 0</li>
                            <li>Set their places unlocked to 0</li>
                            <li>Remove all their unlocked locations</li>
                          </ul>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => resetUserStatsMutation.mutate(user.id)}
                          disabled={resetUserStatsMutation.isPending}
                          className="bg-orange-600 text-white hover:bg-orange-700"
                        >
                          {resetUserStatsMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Resetting...
                            </>
                          ) : (
                            'Reset Stats'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Delete User Dialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={deleteUserMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {user.username}'s account? This will permanently 
                          delete all their data including photos, trip plans, unlocked locations, and comments. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteUserMutation.mutate(user.id)}
                          disabled={deleteUserMutation.isPending}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteUserMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Delete User'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
