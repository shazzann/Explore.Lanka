
export type Tables = {
  // Existing tables
  hotel_visits: {
    id: string;
    hotel_id?: string;
    user_id?: string;
    points_earned: number;
    visited_at?: string;
  };
  hotels: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
    description?: string;
    image_url?: string;
    website_url?: string;
    bonus_points?: number;
    is_active?: boolean;
    created_at?: string;
  };
  locations: {
    id: string;
    name: string;
    description: string;
    short_description?: string;
    latitude: number;
    longitude: number;
    region: string;
    category: string;
    image_url?: string;
    points?: number;
    created_at?: string;
    created_by?: string;
    is_active?: boolean;
  };
  location_facts: {
    id: string;
    location_id?: string;
    fact: string;
  };
  photos: {
    id: string;
    image_url: string;
    user_id?: string;
    location_id?: string;
    caption?: string;
    likes_count?: number;
    created_at?: string;
  };
  profiles: {
    id: string;
    username?: string;
    avatar_url?: string;
    role?: string;
    points?: number;
    places_unlocked?: number;
    created_at?: string;
    updated_at?: string;
  };
  user_locations: {
    id: string;
    user_id: string;
    location_id: string;
    points_earned: number;
    unlocked_at?: string;
  };
  // Trip planning tables
  trip_plans: {
    id: string;
    user_id: string;
    title: string;
    start_date?: string;
    end_date?: string;
    notes?: string;
    accommodation?: string;
    transportation?: string;
    created_at?: string;
  };
  trip_locations: {
    id: string;
    trip_id: string;
    location_id: string;
    order_index: number;
  };
};
