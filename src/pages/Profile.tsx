
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Trophy, MapPin, Camera, User, Lock, Loader2, ZoomIn, X, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const formSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Profile = () => {
  const { user, profile } = useAuth();
  const { unlockedLocations, locationsLoading, userPhotos, photosLoading, updateProfile, handleAvatarUpload, deleteAccount } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Form for profile updates
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile?.username || '',
      email: user?.email || '',
    },
  });

  // Handler for profile form submission
  const onSubmit = async (values: FormValues) => {
    setIsUpdating(true);
    try {
      await updateProfile.mutateAsync({ username: values.username });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password reset request
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      
      if (error) throw error;
      
      toast({
        title: 'Password reset link sent',
        description: 'Check your email for a password reset link.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send reset link',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (profile?.username) {
      return profile.username.substring(0, 2).toUpperCase();
    } else if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (!user || !profile) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container px-4 py-6 space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile sidebar */}
          <div className="md:w-1/3">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-2xl bg-secondary text-foreground">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="mb-4">
                  <ProfilePictureUpload onUploadComplete={handleAvatarUpload} />
                </div>
                <CardTitle className="text-2xl">{profile.username || 'Explorer'}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="text-center py-3 bg-secondary/50 rounded-md">
                    <p className="text-2xl font-semibold text-primary">{profile.points || 0}</p>
                    <p className="text-sm text-muted-foreground">Points</p>
                  </div>
                  <div className="text-center py-3 bg-secondary/50 rounded-md">
                    <p className="text-2xl font-semibold text-primary">{profile.places_unlocked || 0}</p>
                    <p className="text-sm text-muted-foreground">Places</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content area */}
          <div className="md:w-2/3">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="account">
                  <User className="mr-2 h-4 w-4 md:hidden" />
                  <span className="hidden md:inline">Account</span>
                  <span className="md:hidden">Account</span>
                </TabsTrigger>
                <TabsTrigger value="places">
                  <MapPin className="mr-2 h-4 w-4 md:hidden" />
                  <span className="hidden md:inline">Places</span>
                  <span className="md:hidden">Places</span>
                </TabsTrigger>
                <TabsTrigger value="photos">
                  <Camera className="mr-2 h-4 w-4 md:hidden" />
                  <span className="hidden md:inline">Photos</span>
                  <span className="md:hidden">Photos</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Account Settings */}
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Update your account information.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="username" {...field} />
                              </FormControl>
                              <FormDescription>
                                This is your public display name.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="email@example.com" 
                                  {...field} 
                                  disabled 
                                  className="bg-muted" 
                                />
                              </FormControl>
                              <FormDescription>
                                Contact support to change your email address.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" disabled={isUpdating}>
                          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="font-medium mb-4 flex items-center">
                        <Lock className="mr-2 h-4 w-4" /> Password
                      </h3>
                      <Button 
                        variant="outline" 
                        onClick={handlePasswordReset}
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Password Reset Link
                      </Button>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="font-medium mb-4 flex items-center text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Danger Zone
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Once you delete your account, there is no going back. This will permanently delete your account and all associated data.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            disabled={deleteAccount.isPending}
                          >
                            {deleteAccount.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account
                              and remove all your data from our servers including your photos, trip plans,
                              unlocked locations, and profile information.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteAccount.mutate()}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Places */}
              <TabsContent value="places">
                <Card>
                  <CardHeader>
                    <CardTitle>My Places</CardTitle>
                    <CardDescription>Places you've unlocked during your exploration.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {locationsLoading ? (
                      <div className="py-8 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-lanka-blue" />
                      </div>
                    ) : unlockedLocations && unlockedLocations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {unlockedLocations.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 border rounded-md">
                            <div className="h-12 w-12 rounded bg-secondary flex items-center justify-center">
                              <MapPin className="h-6 w-6 text-lanka-blue" />
                            </div>
                            <div>
                              <p className="font-medium">{item.locations.name}</p>
                              <p className="text-xs text-muted-foreground">{item.locations.region}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <MapPin className="h-12 w-12 text-muted-foreground mb-3 mx-auto" />
                        <p className="text-muted-foreground">You haven't unlocked any places yet.</p>
                        <Button 
                          variant="link"
                          onClick={() => navigate('/')}
                          className="mt-2"
                        >
                          Explore places
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Photos */}
              <TabsContent value="photos">
                <Card>
                  <CardHeader>
                    <CardTitle>My Photos</CardTitle>
                    <CardDescription>Photos you've shared from your explorations.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {photosLoading ? (
                      <div className="py-8 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-lanka-blue" />
                      </div>
                    ) : userPhotos && userPhotos.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {userPhotos.map((photo) => (
                            <div key={photo.id} className="aspect-square rounded-md overflow-hidden relative group">
                              <img 
                                src={photo.image_url} 
                                alt={photo.caption || "User photo"} 
                                className="h-full w-full object-cover cursor-pointer" 
                                onClick={() => setSelectedPhoto(photo.image_url)}
                              />
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setSelectedPhoto(photo.image_url)}
                              >
                                <ZoomIn className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        
                        <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
                          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
                            <div className="relative w-full">
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="absolute top-2 right-2 z-10" 
                                onClick={() => setSelectedPhoto(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              {selectedPhoto && (
                                <img 
                                  src={selectedPhoto} 
                                  alt="Photo" 
                                  className="w-full max-h-[80vh] object-contain" 
                                />
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : (
                      <div className="py-8 text-center">
                        <Camera className="h-12 w-12 text-muted-foreground mb-3 mx-auto" />
                        <p className="text-muted-foreground">You haven't shared any photos yet.</p>
                        <Button 
                          variant="link"
                          onClick={() => navigate('/photos')}
                          className="mt-2"
                        >
                          Upload photos
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
