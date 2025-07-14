
import React from 'react';
import LocationForm from './LocationForm';
import FactForm from './FactForm';
import LocationsTable, { TableLocation } from './LocationsTable';
import { Location } from '@/components/LocationCard';

interface LocationsTabProps {
  locations: Location[];
  newLocation: {
    name: string;
    description: string;
    short_description: string;
    latitude: string;
    longitude: string;
    region: string;
    category: string;
    points: number;
    image_url: string;
  };
  newFact: {
    location_id: string;
    fact: string;
  };
  onLocationInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCategoryChange: (value: string) => void;
  onLocationSubmit: (e: React.FormEvent) => void;
  onFactInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLocationSelect: (value: string) => void;
  onFactSubmit: (e: React.FormEvent) => void;
  onEditLocation: (location: Location) => void;
  isSubmitting: boolean;
}

const LocationsTab: React.FC<LocationsTabProps> = ({
  locations,
  newLocation,
  newFact,
  onLocationInputChange,
  onCategoryChange,
  onLocationSubmit,
  onFactInputChange,
  onLocationSelect,
  onFactSubmit,
  onEditLocation,
  isSubmitting
}) => {
  // Convert Location[] to TableLocation[] by mapping only the required properties
  const tableLocations: TableLocation[] = locations.map(loc => ({
    id: loc.id,
    name: loc.name,
    region: loc.region,
    category: loc.category,
    points: loc.points,
    is_active: loc.is_active
  }));
  
  // Create a handler that converts TableLocation back to full Location when editing
  const handleEditLocation = (tableLocation: TableLocation) => {
    const fullLocation = locations.find(loc => loc.id === tableLocation.id);
    if (fullLocation) {
      onEditLocation(fullLocation);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LocationForm
          locationData={newLocation}
          onLocationInputChange={onLocationInputChange}
          onCategoryChange={onCategoryChange}
          onSubmit={onLocationSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Create Location"
        />
        
        <FactForm
          locations={locations}
          factData={newFact}
          onLocationSelect={onLocationSelect}
          onFactInputChange={onFactInputChange}
          onSubmit={onFactSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
      
      <LocationsTable
        locations={tableLocations}
        onEdit={handleEditLocation}
      />
    </>
  );
};

export default LocationsTab;
