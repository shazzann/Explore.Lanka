
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Location } from '@/components/LocationCard';
import EditLocationForm from '@/components/admin/EditLocationForm';
import EditHotelForm from '@/components/admin/EditHotelForm';

// Import the refactored components
import OverviewTab from '@/components/admin/OverviewTab';
import UsersTable from '@/components/admin/UsersTable';
import LocationsTab from '@/components/admin/LocationsTab';
import HotelsTab from '@/components/admin/HotelsTab';
import PhotoLikesTab from '@/components/admin/PhotoLikesTab';
import PhotoCommentsTab from '@/components/admin/PhotoCommentsTab';

const AdminDashboard = () => {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for editing locations
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // State for editing hotels
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [isEditHotelDialogOpen, setIsEditHotelDialogOpen] = useState(false);
  
  // New location form state
  const [newLocation, setNewLocation] = useState({
    name: '',
    description: '',
    short_description: '',
    latitude: '',
    longitude: '',
    region: '',
    category: '',
    points: 50,
    image_url: ''
  });
  
  // New hotel form state
  const [newHotel, setNewHotel] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    image_url: '',
    website_url: '',
    bonus_points: 100
  });
  
  // New fact form state
  const [newFact, setNewFact] = useState({
    location_id: '',
    fact: ''
  });

  useEffect(() => {
    // Protect the route
    if (!isLoading && !isAdmin) {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      });
    } else if (!isLoading && isAdmin) {
      fetchData();
    }
  }, [isAdmin, isLoading, navigate, toast]);

  const fetchData = async () => {
    try {
      // Fetch locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('*');
      
      if (locationsError) throw locationsError;
      setLocations(locationsData);
      
      // Fetch hotels
      const { data: hotelsData, error: hotelsError } = await supabase
        .from('hotels')
        .select('*');
      
      if (hotelsError) throw hotelsError;
      setHotels(hotelsData);
      
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (usersError) throw usersError;
      setUsers(usersData);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to handle edit button click
  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setIsEditDialogOpen(true);
  };

  // Function to close the edit dialog
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingLocation(null);
  };

  // Function to handle edit hotel button click
  const handleEditHotel = (hotel: any) => {
    setEditingHotel(hotel);
    setIsEditHotelDialogOpen(true);
  };

  // Function to close the edit hotel dialog
  const handleCloseEditHotelDialog = () => {
    setIsEditHotelDialogOpen(false);
    setEditingHotel(null);
  };

  // Form handlers
  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({ ...prev, [name]: value }));
  };

  const handleHotelInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewHotel(prev => ({ ...prev, [name]: value }));
  };

  const handleFactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFact(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setNewLocation(prev => ({ ...prev, category: value }));
  };

  const handleLocationSelect = (value: string) => {
    setNewFact(prev => ({ ...prev, location_id: value }));
  };

  // Form submissions
  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('locations')
        .insert([{
          name: newLocation.name,
          description: newLocation.description,
          short_description: newLocation.short_description,
          latitude: parseFloat(newLocation.latitude),
          longitude: parseFloat(newLocation.longitude),
          region: newLocation.region,
          category: newLocation.category,
          points: parseInt(newLocation.points.toString()),
          image_url: newLocation.image_url
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Location created successfully!"
      });
      
      // Reset form and reload data
      setNewLocation({
        name: '',
        description: '',
        short_description: '',
        latitude: '',
        longitude: '',
        region: '',
        category: '',
        points: 50,
        image_url: ''
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create location.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHotelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('hotels')
        .insert([{
          name: newHotel.name,
          description: newHotel.description,
          latitude: parseFloat(newHotel.latitude),
          longitude: parseFloat(newHotel.longitude),
          address: newHotel.address,
          image_url: newHotel.image_url,
          website_url: newHotel.website_url,
          bonus_points: parseInt(newHotel.bonus_points.toString())
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Hotel created successfully!"
      });
      
      // Reset form and reload data
      setNewHotel({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        address: '',
        image_url: '',
        website_url: '',
        bonus_points: 100
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create hotel.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('location_facts')
        .insert([{
          location_id: newFact.location_id,
          fact: newFact.fact
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Fact added successfully!"
      });
      
      // Reset form
      setNewFact({
        location_id: '',
        fact: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add fact.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container px-4 md:px-6 py-6 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container px-4 md:px-6 py-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="hotels">Hotels</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="photo-likes">Photo Likes</TabsTrigger>
            <TabsTrigger value="photo-comments">Comments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTab 
              usersCount={users.length} 
              locationsCount={locations.length} 
              hotelsCount={hotels.length} 
            />
          </TabsContent>
          
          <TabsContent value="locations">
            <LocationsTab 
              locations={locations}
              newLocation={newLocation}
              newFact={newFact}
              onLocationInputChange={handleLocationInputChange}
              onCategoryChange={handleCategoryChange}
              onLocationSubmit={handleLocationSubmit}
              onFactInputChange={handleFactInputChange}
              onLocationSelect={handleLocationSelect}
              onFactSubmit={handleFactSubmit}
              onEditLocation={handleEditLocation}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
          
          <TabsContent value="hotels">
            <HotelsTab 
              hotels={hotels}
              onHotelSubmit={handleHotelSubmit}
              hotelFormData={newHotel}
              onHotelInputChange={handleHotelInputChange}
              isSubmitting={isSubmitting}
              onEditHotel={handleEditHotel}
            />
          </TabsContent>
          
          <TabsContent value="users">
            <UsersTable users={users} />
          </TabsContent>
          
          <TabsContent value="photo-likes">
            <PhotoLikesTab />
          </TabsContent>
          
          <TabsContent value="photo-comments">
            <PhotoCommentsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Render the Edit Location Dialog */}
      {isEditDialogOpen && (
        <EditLocationForm
          location={editingLocation}
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
        />
      )}

      {/* Render the Edit Hotel Dialog */}
      {isEditHotelDialogOpen && (
        <EditHotelForm
          hotel={editingHotel}
          isOpen={isEditHotelDialogOpen}
          onClose={handleCloseEditHotelDialog}
        />
      )}
      <Footer />
    </div>
  );
};

export default AdminDashboard;
