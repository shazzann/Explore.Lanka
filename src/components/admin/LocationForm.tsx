
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface LocationFormData {
  name: string;
  description: string;
  short_description: string;
  latitude: string;
  longitude: string;
  region: string;
  category: string;
  points: number;
  image_url: string;
}

interface LocationFormProps {
  locationData: LocationFormData;
  onLocationInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCategoryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitButtonText: string;
}

const LocationForm: React.FC<LocationFormProps> = ({ 
  locationData, 
  onLocationInputChange, 
  onCategoryChange,
  onSubmit, 
  isSubmitting, 
  submitButtonText 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Location</CardTitle>
        <CardDescription>Create a new location for users to discover</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name</Label>
            <Input 
              id="name" 
              name="name" 
              value={locationData.name} 
              onChange={onLocationInputChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input 
                id="latitude" 
                name="latitude" 
                type="number" 
                step="0.000001" 
                value={locationData.latitude} 
                onChange={onLocationInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input 
                id="longitude" 
                name="longitude" 
                type="number" 
                step="0.000001" 
                value={locationData.longitude} 
                onChange={onLocationInputChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input 
                id="region" 
                name="region" 
                value={locationData.region} 
                onChange={onLocationInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                name="category"
                value={locationData.category}
                onValueChange={onCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                  <SelectItem value="Natural">Natural</SelectItem>
                  <SelectItem value="Historical">Historical</SelectItem>
                  <SelectItem value="Beach">Beach</SelectItem>
                  <SelectItem value="Wildlife">Wildlife</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Input 
              id="short_description" 
              name="short_description" 
              value={locationData.short_description} 
              onChange={onLocationInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={locationData.description} 
              onChange={onLocationInputChange}
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Points Value</Label>
              <Input 
                id="points" 
                name="points" 
                type="number" 
                value={locationData.points} 
                onChange={onLocationInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input 
                id="image_url" 
                name="image_url" 
                value={locationData.image_url} 
                onChange={onLocationInputChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating...' : submitButtonText}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LocationForm;
