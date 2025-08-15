
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Location } from '@/components/LocationCard';

interface FactFormProps {
  locations: Location[];
  factData: {
    location_id: string;
    fact: string;
  };
  onLocationSelect: (value: string) => void;
  onFactInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const FactForm: React.FC<FactFormProps> = ({
  locations,
  factData,
  onLocationSelect,
  onFactInputChange,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Location Fact</CardTitle>
        <CardDescription>Add interesting facts to existing locations</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location_id">Select Location</Label>
            <Select
              value={factData.location_id}
              onValueChange={onLocationSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location: Location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fact">Interesting Fact</Label>
            <Textarea 
              id="fact" 
              name="fact" 
              value={factData.fact} 
              onChange={onFactInputChange}
              rows={4}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Adding...' : 'Add Fact'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FactForm;
