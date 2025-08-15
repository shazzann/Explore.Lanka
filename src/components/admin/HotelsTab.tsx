
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit } from 'lucide-react';

interface HotelFormData {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  address: string;
  image_url: string;
  website_url: string;
  bonus_points: number;
}

interface HotelsTabProps {
  hotels: any[];
  onHotelSubmit: (e: React.FormEvent) => void;
  hotelFormData: HotelFormData;
  onHotelInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isSubmitting: boolean;
  onEditHotel: (hotel: any) => void;
}

const HotelsTab: React.FC<HotelsTabProps> = ({ 
  hotels, 
  onHotelSubmit, 
  hotelFormData, 
  onHotelInputChange, 
  isSubmitting,
  onEditHotel 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Add Hotel Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Partner Hotel</CardTitle>
          <CardDescription>Create a new partner hotel</CardDescription>
        </CardHeader>
        <form onSubmit={onHotelSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Hotel Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={hotelFormData.name} 
                onChange={onHotelInputChange}
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
                  value={hotelFormData.latitude} 
                  onChange={onHotelInputChange}
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
                  value={hotelFormData.longitude} 
                  onChange={onHotelInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                name="address" 
                value={hotelFormData.address} 
                onChange={onHotelInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={hotelFormData.description} 
                onChange={onHotelInputChange}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input 
                id="website_url" 
                name="website_url" 
                value={hotelFormData.website_url} 
                onChange={onHotelInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bonus_points">Bonus Points</Label>
                <Input 
                  id="bonus_points" 
                  name="bonus_points" 
                  type="number" 
                  value={hotelFormData.bonus_points} 
                  onChange={onHotelInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input 
                  id="image_url" 
                  name="image_url" 
                  value={hotelFormData.image_url} 
                  onChange={onHotelInputChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Creating...' : 'Add Hotel Partner'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Hotels Table */}
      <div>
        <h3 className="text-xl font-bold mb-4">Partner Hotels</h3>
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hotel Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Bonus Points</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.map((hotel: any) => (
                <TableRow key={hotel.id}>
                  <TableCell>{hotel.name}</TableCell>
                  <TableCell>{hotel.address}</TableCell>
                  <TableCell>{hotel.bonus_points}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditHotel(hotel)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default HotelsTab;
