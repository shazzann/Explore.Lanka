import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Hotel {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  image_url?: string;
  website_url?: string;
  bonus_points?: number;
  is_active?: boolean;
}

interface EditHotelFormProps {
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditHotelForm: React.FC<EditHotelFormProps> = ({
  hotel,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm({
    defaultValues: {
      name: hotel?.name || '',
      description: hotel?.description || '',
      latitude: hotel?.latitude?.toString() || '',
      longitude: hotel?.longitude?.toString() || '',
      address: hotel?.address || '',
      image_url: hotel?.image_url || '',
      website_url: hotel?.website_url || '',
      bonus_points: hotel?.bonus_points?.toString() || '100'
    }
  });
  
  React.useEffect(() => {
    if (hotel) {
      form.reset({
        name: hotel.name || '',
        description: hotel.description || '',
        latitude: hotel.latitude?.toString() || '',
        longitude: hotel.longitude?.toString() || '',
        address: hotel.address || '',
        image_url: hotel.image_url || '',
        website_url: hotel.website_url || '',
        bonus_points: hotel.bonus_points?.toString() || '100'
      });
    }
  }, [hotel, form]);
  
  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      if (!hotel) throw new Error('No hotel selected');
      
      const { error } = await supabase
        .from('hotels')
        .update({
          name: values.name,
          description: values.description,
          latitude: parseFloat(values.latitude),
          longitude: parseFloat(values.longitude),
          address: values.address,
          image_url: values.image_url,
          website_url: values.website_url,
          bonus_points: parseInt(values.bonus_points)
        })
        .eq('id', hotel.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Hotel updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update hotel.",
        variant: "destructive",
      });
    }
  });
  
  const handleSubmit = (values: any) => {
    updateMutation.mutate(values);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Hotel</DialogTitle>
          <DialogDescription>
            Make changes to the selected hotel. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Name</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.000001" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.000001" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bonus_points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bonus Points</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHotelForm;