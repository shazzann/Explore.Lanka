import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocations } from '@/hooks/use-locations';

const PhotoUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { locations } = useLocations();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!photoFile || !user) throw new Error('Missing photo or user');
      
      // Upload photo to storage
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `photos/${user.id}/${fileName}`;
      
      // Try upload
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, photoFile);
      if (uploadError) {
        console.error('Storage upload failed', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) {
        console.error('Failed to get publicUrl for image.');
        throw new Error('No publicUrl returned');
      }

      // Save to DB
      const { error: insertError } = await supabase
        .from('photos')
        .insert({
          image_url: publicUrl,
          user_id: user.id,
          caption: caption,
          location_id: selectedLocationId || null,
          likes_count: 0
        });
      if (insertError) {
        console.error('DB insertion error', insertError);
        throw insertError;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Photo uploaded!',
        description: 'Your photo has been uploaded successfully.',
      });
      
      // Reset form
      resetForm();
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
    onError: (error: any) => {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'There was an error uploading your photo.',
        variant: 'destructive',
      });
    }
  });
  
  const resetForm = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setCaption('');
    setSelectedLocationId(null);
    setIsDialogOpen(false);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Open the dialog
      setIsDialogOpen(true);
    }
  };
  
  const handleUpload = () => {
    uploadMutation.mutate();
  };
  
  return (
    <>
      <label className="cursor-pointer">
        <Input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button variant="default" className="gap-2">
          <Camera className="h-4 w-4" />
          Upload Photo
        </Button>
      </label>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {photoPreview && (
              <div className="w-full rounded-md overflow-hidden aspect-square bg-muted">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Location (Optional)</Label>
              <Select value={selectedLocationId || ''} onValueChange={setSelectedLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
              
              <Button 
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoUpload;
