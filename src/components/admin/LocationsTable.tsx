
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Location } from '@/components/LocationCard';

// Define TableLocation interface that contains only the properties needed for the table
export interface TableLocation {
  id: string;
  name: string;
  region: string;
  category: string;
  points?: number; // Make points optional to match the Location type
  is_active?: boolean;
}

interface LocationsTableProps {
  locations: TableLocation[];
  onEdit: (location: TableLocation) => void;
}

const LocationsTable: React.FC<LocationsTableProps> = ({ locations, onEdit }) => {
  return (
    <div className="mt-8 border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((location) => (
            <TableRow key={location.id}>
              <TableCell className="font-medium">{location.name}</TableCell>
              <TableCell>{location.region}</TableCell>
              <TableCell>{location.category}</TableCell>
              <TableCell>{location.points}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  location.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {location.is_active ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEdit(location)}
                >
                  <Edit size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LocationsTable;
