
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface OverviewTabProps {
  usersCount: number;
  locationsCount: number;
  hotelsCount: number;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
  usersCount, 
  locationsCount, 
  hotelsCount 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Total registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{usersCount}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
          <CardDescription>Available locations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{locationsCount}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Hotels</CardTitle>
          <CardDescription>Partner hotels</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{hotelsCount}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
