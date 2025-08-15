
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, MapPin, Calendar, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLocations } from '@/hooks/use-locations';
import { useHotels } from '@/hooks/use-hotels';
import { useTripPlans } from '@/hooks/use-trip-plans';
import { useAuth } from '@/contexts/AuthContext';

interface TripSuggestion {
  day: number;
  location: string;
  activities: string[];
  tips: string;
}

interface TripPlan {
  title: string;
  duration: string;
  suggestions: TripSuggestion[];
  budget: string;
  transport: string;
}

interface AITripPlannerProps {
  onSavePlan?: (plan: TripPlan) => void;
}

const AITripPlanner: React.FC<AITripPlannerProps> = ({ onSavePlan }) => {
  const [preferences, setPreferences] = useState({
    duration: '',
    budget: '',
    interests: '',
    groupSize: '',
    startLocation: ''
  });
  const [generatedPlan, setGeneratedPlan] = useState<TripPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { locations } = useLocations();
  const { hotels } = useHotels();
  const { user } = useAuth();
  const { createTripPlan } = useTripPlans();

  const generateTripPlan = async () => {
    if (!preferences.duration || !preferences.interests) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in duration and interests to generate a trip plan.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Get available location names for the prompt
      const availableLocations = locations.map(loc => loc.name).join(', ');
      
      // Create a detailed prompt for Gemini with actual locations
      const prompt = `Create a detailed ${preferences.duration}-day Sri Lanka travel itinerary for someone interested in ${preferences.interests}. 

IMPORTANT: You must ONLY use locations from this list of available destinations: ${availableLocations}

Additional details:
- Budget: ${preferences.budget || 'moderate'} (in Sri Lankan Rupees - LKR)
- Group size: ${preferences.groupSize || '2 people'}
- Starting location: ${preferences.startLocation || 'Colombo'}

Please provide:
1. A day-by-day breakdown using ONLY the locations from the available list above
2. 3-4 activities per day that match their interests
3. Practical tips for each day
4. Transportation recommendations
5. Budget considerations in LKR

Format the response as a structured itinerary that's practical and actionable for travelers. Ensure every location mentioned is from the available destinations list.`;

      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { message: prompt }
      });

      if (error) {
        throw error;
      }

      // Parse the AI response and create a structured trip plan
      const aiResponse = data.response;
      const plan = parseAIResponseToTripPlan(aiResponse, preferences);
      
      setGeneratedPlan(plan);
      
      toast({
        title: 'AI Trip Plan Generated!',
        description: 'Your personalized Sri Lanka itinerary powered by Google AI is ready.',
      });
    } catch (error) {
      console.error('Error generating trip plan:', error);
      
      // Fallback to basic plan if AI fails
      const plan = createBasicTripPlan(preferences);
      setGeneratedPlan(plan);
      
      toast({
        title: 'Trip Plan Generated',
        description: 'Generated using our travel database. AI enhancement temporarily unavailable.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const parseAIResponseToTripPlan = (aiResponse: string, prefs: typeof preferences): TripPlan => {
    const duration = parseInt(prefs.duration) || 7;
    const suggestions: TripSuggestion[] = [];
    
    // Split the response into sections and extract day-by-day information
    const lines = aiResponse.split('\n');
    let currentDay = 0;
    let currentLocation = '';
    let currentActivities: string[] = [];
    let currentTips = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for day markers (Day 1, Day 2, etc.)
      const dayMatch = trimmedLine.match(/Day\s+(\d+)/i);
      if (dayMatch) {
        // Save previous day if exists
        if (currentDay > 0) {
          suggestions.push({
            day: currentDay,
            location: currentLocation || `Day ${currentDay} Location`,
            activities: currentActivities.length > 0 ? currentActivities : [`Day ${currentDay} activities`],
            tips: currentTips || `Enjoy your day ${currentDay}!`
          });
        }
        
        currentDay = parseInt(dayMatch[1]);
        currentLocation = '';
        currentActivities = [];
        currentTips = '';
        continue;
      }
      
      // Extract location information
      if (trimmedLine.includes(':') && (trimmedLine.toLowerCase().includes('location') || trimmedLine.toLowerCase().includes('destination'))) {
        currentLocation = trimmedLine.split(':')[1]?.trim() || '';
      }
      
      // Extract activities (lines with bullet points or dashes)
      if (trimmedLine.match(/^[-•*]\s+/) || trimmedLine.match(/^\d+\.\s+/)) {
        const activity = trimmedLine.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '').trim();
        if (activity) currentActivities.push(activity);
      }
      
      // Extract tips
      if (trimmedLine.toLowerCase().includes('tip') && trimmedLine.includes(':')) {
        currentTips = trimmedLine.split(':')[1]?.trim() || '';
      }
    }
    
    // Add the last day
    if (currentDay > 0) {
      suggestions.push({
        day: currentDay,
        location: currentLocation || `Day ${currentDay} Location`,
        activities: currentActivities.length > 0 ? currentActivities : [`Day ${currentDay} activities`],
        tips: currentTips || `Enjoy your day ${currentDay}!`
      });
    }
    
    // If parsing failed, create basic structure
    if (suggestions.length === 0) {
      for (let day = 1; day <= duration; day++) {
        suggestions.push({
          day,
          location: `Day ${day} - AI Suggested Location`,
          activities: ['AI curated activities for this day'],
          tips: 'AI generated tips for optimal experience'
        });
      }
    }
    
  return {
    title: `AI-Curated ${duration}-Day Sri Lanka Journey`,
    duration: `${duration} days`,
    suggestions,
    budget: prefs.budget || 'Moderate (LKR 10,000-20,000/day)',
    transport: 'AI-optimized transport recommendations'
  };
  };

  const createBasicTripPlan = (prefs: typeof preferences): TripPlan => {
    const duration = parseInt(prefs.duration) || 7;
    const interests = prefs.interests.toLowerCase();
    
    const suggestions: TripSuggestion[] = [];
    
    for (let day = 1; day <= duration; day++) {
      let location: string;
      let activities: string[];
      let tips: string;

      if (day === 1) {
        location = "Colombo";
        activities = ["Arrival and city exploration", "Visit Gangaramaya Temple", "Galle Face Green sunset"];
        tips = "Start with light activities to adjust to the local time.";
      } else if (interests.includes('beach') && day <= 3) {
        location = "Galle/Unawatuna";
        activities = ["Beach relaxation", "Galle Fort exploration", "Snorkeling or diving"];
        tips = "Don't forget sunscreen and stay hydrated!";
      } else if (interests.includes('culture') || interests.includes('temple')) {
        location = day % 2 === 0 ? "Kandy" : "Sigiriya";
        activities = day % 2 === 0 ? 
          ["Temple of the Tooth", "Royal Botanical Gardens", "Cultural dance show"] :
          ["Sigiriya Rock climb", "Village tour", "Ancient ruins exploration"];
        tips = "Wear comfortable walking shoes and carry water.";
      } else {
        const locations = ["Ella", "Nuwara Eliya", "Anuradhapura", "Polonnaruwa"];
        location = locations[(day - 2) % locations.length];
        activities = ["Local sightseeing", "Cultural experiences", "Local cuisine tasting"];
        tips = "Try local food and interact with friendly locals!";
      }

      suggestions.push({ day, location, activities, tips });
    }

    return {
      title: `${duration}-Day Sri Lanka Adventure`,
      duration: `${duration} days`,
      suggestions,
      budget: prefs.budget || 'Moderate (LKR 10,000-20,000/day)',
      transport: 'Mix of private transport and public transport'
    };
  };

  const handleSaveToMyTrips = async () => {
    if (!generatedPlan) return;
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your trip plan.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Convert AI plan to trip plan format
      const formData = {
        title: generatedPlan.title,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + (generatedPlan.suggestions.length * 24 * 60 * 60 * 1000)).toISOString(),
        notes: `AI Generated Plan:\n\nActivities per day:\n${generatedPlan.suggestions.map(s => `Day ${s.day}: ${s.activities.join(', ')}\n\nTips: ${s.tips}`).join('\n\n')}`,
        accommodation: generatedPlan.budget,
        transportation: generatedPlan.transport,
        locations: generatedPlan.suggestions.map((suggestion, index) => {
          // Try to match location name with existing locations
          const matchedLocation = locations.find(loc => 
            loc.name.toLowerCase().includes(suggestion.location.toLowerCase()) ||
            suggestion.location.toLowerCase().includes(loc.name.toLowerCase())
          );
          
          return {
            id: matchedLocation?.id || `ai-${index}`,
            name: suggestion.location,
            order: index
          };
        })
      };

      await createTripPlan.mutateAsync(formData);
      
      toast({
        title: "Trip Saved!",
        description: "Your AI-generated trip plan has been saved to My Trips.",
      });
    } catch (error) {
      console.error("Error saving trip plan:", error);
      toast({
        title: "Error",
        description: "Failed to save trip plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-lanka-green" />
            AI Trip Planning Assistant
            <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full">
              Powered by Google AI
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Trip Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="30"
                value={preferences.duration}
                onChange={(e) => setPreferences(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="7"
              />
            </div>
            
            <div>
              <Label htmlFor="budget">Budget Range</Label>
              <Select value={preferences.budget} onValueChange={(value) => setPreferences(prev => ({ ...prev, budget: value }))}>
                <SelectTrigger id="budget">
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget (LKR 5,000-10,000/day)</SelectItem>
                  <SelectItem value="moderate">Moderate (LKR 10,000-20,000/day)</SelectItem>
                  <SelectItem value="luxury">Luxury (LKR 20,000+/day)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="groupSize">Group Size</Label>
              <Select value={preferences.groupSize} onValueChange={(value) => setPreferences(prev => ({ ...prev, groupSize: value }))}>
                <SelectTrigger id="groupSize">
                  <SelectValue placeholder="How many people?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Solo traveler</SelectItem>
                  <SelectItem value="couple">Couple (2 people)</SelectItem>
                  <SelectItem value="small">Small group (3-5)</SelectItem>
                  <SelectItem value="large">Large group (6+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="startLocation">Starting Point (Hotel)</Label>
              <Select value={preferences.startLocation} onValueChange={(value) => setPreferences(prev => ({ ...prev, startLocation: value }))}>
                <SelectTrigger id="startLocation">
                  <SelectValue placeholder="Select your hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map(hotel => (
                    <SelectItem key={hotel.id} value={hotel.name}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="interests">Interests & Preferences</Label>
            <Textarea
              id="interests"
              value={preferences.interests}
              onChange={(e) => setPreferences(prev => ({ ...prev, interests: e.target.value }))}
              placeholder="e.g., beaches, temples, wildlife, culture, adventure sports, local food..."
              className="min-h-[80px]"
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={generateTripPlan}
              disabled={isGenerating}
              className="flex-1 bg-lanka-green hover:bg-lanka-green/90"
            >
              {isGenerating ? 'Generating Your Perfect Trip...' : 'Generate AI Trip Plan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-lanka-blue" />
              {generatedPlan.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Calendar className="h-3 w-3 mr-1" />
                {generatedPlan.duration}
              </Badge>
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {preferences.groupSize || 'Flexible'}
              </Badge>
              <Badge variant="outline">{generatedPlan.budget}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedPlan.suggestions.map((suggestion, index) => (
                <div key={index}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-lanka-blue text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {suggestion.day}
                    </div>
                    <h3 className="font-semibold text-lg">{suggestion.location}</h3>
                  </div>
                  <div className="ml-11 space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {suggestion.activities.map((activity, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.tips}</p>
                  </div>
                  {index < generatedPlan.suggestions.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex gap-3">
              <Button
                onClick={handleSaveToMyTrips}
                className="bg-lanka-blue hover:bg-lanka-blue/90"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save to My Trips'}
              </Button>
              {onSavePlan && (
                <Button
                  onClick={() => onSavePlan(generatedPlan)}
                  variant="outline"
                  className="px-6"
                >
                  Import to Manual Planner
                </Button>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p><strong>Transportation:</strong> {generatedPlan.transport}</p>
              <p className="mt-1"><strong>Budget Guide:</strong> {generatedPlan.budget}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AITripPlanner;
