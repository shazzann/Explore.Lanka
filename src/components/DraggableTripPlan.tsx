import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Position,
  Handle,
  NodeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '../styles/react-flow.css';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Navigation, X, Info } from "lucide-react";

interface TripLocation {
  id: string;
  name: string;
  order: number;
}

interface DraggableTripPlanProps {
  locations: TripLocation[];
  onReorder: (locations: TripLocation[]) => void;
  onRemove: (locationId: string) => void;
  onLocationDetails: (locationId: string) => void;
  travelTimes?: Record<string, number>; // in minutes
  currentLocation?: { latitude: number; longitude: number } | null;
}

// Custom node component for trip locations
const TripLocationNode = ({ data }: { data: any }) => {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Card className="p-3 min-w-[200px] max-w-[250px] bg-background border-2 hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {data.order + 1}
              </Badge>
              <span className="text-xs text-muted-foreground">Stop</span>
            </div>
            <h3 className="font-semibold text-sm truncate">{data.name}</h3>
            {data.travelTime && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {data.order === 0 && data.travelTime ? 
                    `${data.travelTime}min from current location` : 
                    `${data.travelTime}min travel`
                  }
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => data.onLocationDetails(data.id)}
            >
              <Info className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={() => data.onRemove(data.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  tripLocation: TripLocationNode,
};

const DraggableTripPlan: React.FC<DraggableTripPlanProps> = ({
  locations,
  onReorder,
  onRemove,
  onLocationDetails,
  travelTimes = {},
  currentLocation
}) => {
  // Convert locations to nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    console.log('DraggableTripPlan - locations changed:', locations);
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    locations.forEach((location, index) => {
      let travelTime: number | undefined;
      
      if (index === 0 && currentLocation) {
        // First location: show travel time from current location
        travelTime = travelTimes[`current-${location.id}`];
      } else if (index > 0) {
        // Subsequent locations: show travel time from previous location
        travelTime = travelTimes[`${locations[index - 1].id}-${location.id}`];
      }
      
      nodes.push({
        id: location.id,
        type: 'tripLocation',
        position: { x: 50, y: index * 180 + 50 },
        data: {
          ...location,
          travelTime,
          onRemove,
          onLocationDetails
        },
        draggable: true,
      });
      
      // Add edge to previous location
      if (index > 0) {
        edges.push({
          id: `${locations[index - 1].id}-${location.id}`,
          source: locations[index - 1].id,
          target: location.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'hsl(var(--primary))' },
        });
      }
    });
    
    return { initialNodes: nodes, initialEdges: edges };
  }, [locations, travelTimes, onRemove, onLocationDetails]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node position changes to reorder locations
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      onNodesChange(changes);
      
      // Check if any node positions changed
      const positionChanges = changes.filter(change => change.type === 'position' && change.dragging === false);
      
      if (positionChanges.length > 0) {
        // Sort nodes by Y position to determine new order
        const updatedNodes = nodes.map(node => {
          const change = positionChanges.find(c => c.id === node.id);
          if (change) {
            return { ...node, position: { ...node.position, y: change.position.y } };
          }
          return node;
        });
        
        const sortedNodes = updatedNodes.sort((a, b) => a.position.y - b.position.y);
        const reorderedLocations = sortedNodes.map((node, index) => ({
          id: node.id,
          name: node.data.name as string,
          order: index
        }));
        
        onReorder(reorderedLocations);
      }
    },
    [onNodesChange, nodes, onReorder]
  );

  if (locations.length === 0) {
    return (
      <Card className="p-8 text-center min-h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <MapPin className="h-12 w-12" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">No locations added yet</h3>
            <p className="text-sm">Add locations from the map to start planning your route</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-3 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Trip Route</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Navigation className="h-3 w-3" />
            <span>Drag to reorder stops</span>
          </div>
        </div>
      </div>
      <div className="w-full h-[500px] bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, minZoom: 0.8, maxZoom: 1.2 }}
          minZoom={0.5}
          maxZoom={2}
          defaultViewport={{ x: 50, y: 50, zoom: 1 }}
          proOptions={{ hideAttribution: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <Background color="#e2e8f0" size={20} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </Card>
  );
};

export default DraggableTripPlan;