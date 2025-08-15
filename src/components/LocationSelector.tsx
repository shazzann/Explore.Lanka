
import React from 'react';
import { Location } from '@/components/LocationCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LocationSelectorProps {
  locations: Location[] | any[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

// Export as both default and named export to support both import styles
export const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  locations, 
  selectedValue, 
  onValueChange, 
  label = "Filter by location", 
  placeholder = "All Locations",
  className = ""
}) => {
  return (
    <div className={className}>
      {label && <Label className="mb-2">{label}</Label>}
      <Select 
        value={selectedValue}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Also export as default to maintain backward compatibility
export default LocationSelector;
