
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Define TableLocation interface that contains only the properties needed for the table
export interface TableLocation {
  id: string;
  name: string;
  region: string;
  category: string;
  points?: number; // Make points optional to match the Location type
  is_active?: boolean;
}

interface LocationsTableProps {
  locations: TableLocation[];
  onEdit: (location: TableLocation) => void;
}

const LocationsTable: React.FC<LocationsTableProps> = ({ locations, onEdit }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast({
        title: 'Location deleted',
        description: 'Location has been permanently deleted.',
      });
      // Refresh the page data
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion failed',
        description: error.message || 'Failed to delete location. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="mt-8 border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => (
            <TableRow key={location.id}>
              <TableCell className="font-medium">{location.name}</TableCell>
              <TableCell>{location.region}</TableCell>
              <TableCell>{location.category}</TableCell>
              <TableCell>{location.points}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  location.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {location.is_active ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(location)}
                  >
                    <Edit size={16} />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={deleteLocationMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Location</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{location.name}"? This will permanently 
                          delete the location and all associated data including user unlocks and facts. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteLocationMutation.mutate(location.id)}
                          disabled={deleteLocationMutation.isPending}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteLocationMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Delete Location'
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

export default LocationsTable;
