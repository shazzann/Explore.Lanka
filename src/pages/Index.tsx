
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Trophy, Camera, Compass, Lock, Unlock } from "lucide-react";
import LocationCard, { Location } from '@/components/LocationCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [featuredLocations, setFeaturedLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchFeaturedLocations = async () => {
      try {
        setLoading(true);
        
        // Fetch top 3 locations
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('*')
          .limit(3);
        
        if (locationsError) throw locationsError;
        
        // Get user's unlocked locations if logged in
        let userUnlockedLocations: Record<string, boolean> = {};
        
        if (user) {
          const { data: userLocData, error: userLocError } = await supabase
            .from('user_locations')
            .select('location_id')
            .eq('user_id', user.id);
          
          if (userLocError) throw userLocError;
          
          userUnlockedLocations = (userLocData || []).reduce((acc: Record<string, boolean>, curr: any) => {
            acc[curr.location_id] = true;
            return acc;
          }, {});
        } else {
          // If user is not logged in, show all locations as locked
          userUnlockedLocations = {};
        }
        
        // Process locations with unlocked status
        const processedLocations = locationsData.map(loc => ({
          ...loc,
          unlocked: !!userUnlockedLocations[loc.id]
        })) as Location[];
        
        setFeaturedLocations(processedLocations);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching featured locations:", error);
        toast({
          title: "Error",
          description: "Failed to load featured locations.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    fetchFeaturedLocations();
  }, [user, toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-16 md:py-24 bg-[url('https://t4.ftcdn.net/jpg/03/22/53/53/240_F_322535378_f2I0DBWZpMIUz6DQdFGzBgasc9uE3CKY.jpg')] bg-cover bg-center bg-no-repeat">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Discover Sri Lanka's Hidden Treasures
              </h1>
              <p className="mx-auto max-w-[700px] md:text-xl text-white/90">
                Explore beautiful locations, earn rewards, and create unforgettable memories on your Sri Lankan adventure.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-lanka-orange hover:bg-lanka-orange/90">
                <Link to="/game">
                  <MapPin className="mr-2 h-5 w-5" /> Start Exploring
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/planner">
                  <Compass className="mr-2 h-5 w-5" /> Plan My Trip
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Game Modes */}
      <section className="py-12 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold text-center mb-8">Choose Your Adventure</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 shadow-elegant border hover:shadow-glow transition-all duration-300 hover-lift">
              <div className="mb-4 p-2 bg-primary/10 rounded-full w-fit">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Game Mode</h3>
              <p className="text-muted-foreground mb-4">
                Visit real locations across Sri Lanka, unlock them in the app, and earn points for each discovery.
              </p>
              <Button asChild variant="default">
                <Link to="/game">Start Exploring</Link>
              </Button>
            </div>
            
            <div className="bg-card rounded-xl p-6 shadow-elegant border hover:shadow-glow transition-all duration-300 hover-lift">
              <div className="mb-4 p-2 bg-secondary/50 rounded-full w-fit">
                <Compass className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trip Planner</h3>
              <p className="text-muted-foreground mb-4">
                Create a personalized itinerary based on your preferences and available time in Sri Lanka.
              </p>
              <Button asChild variant="outline">
                <Link to="/planner">Plan My Trip</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Locations */}
      <section className="py-12 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Featured Locations</h2>
              <p className="text-muted-foreground">Explore these popular destinations across Sri Lanka</p>
            </div>
            {!user && (
              <div className="flex items-center text-amber-600 font-medium text-sm px-3 py-2 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 rounded-md">
                <Lock className="h-4 w-4 mr-2" />
                <span>Sign in to unlock locations</span>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[360px] bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : featuredLocations.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredLocations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured locations available</p>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link to="/game">View All Locations</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-12 bg-secondary/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold text-center mb-8">App Features</h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg shadow-elegant border hover-lift text-center">
              <div className="mx-auto mb-4 p-2 bg-primary/10 rounded-full w-fit">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">GPS Exploration</h3>
              <p className="text-sm text-muted-foreground">
                Visit real locations and unlock them with GPS verification.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-elegant border hover-lift text-center">
              <div className="mx-auto mb-4 p-2 bg-accent rounded-full w-fit">
                <Trophy className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-bold mb-2">Points & Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Earn points for each location you discover and climb the leaderboard.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-elegant border hover-lift text-center">
              <div className="mx-auto mb-4 p-2 bg-secondary rounded-full w-fit">
                <Camera className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="font-bold mb-2">Photo Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Capture and share your favorite moments from your Sri Lankan adventure.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
