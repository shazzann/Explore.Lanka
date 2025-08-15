
export interface Location {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image: string;
  points: number;
  category: LocationCategory;
  region: Region;
  unlocked: boolean;
  facts: string[];
}

export interface User {
  id: number;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  locationsUnlocked: number;
  joinDate: string;
}

export interface PhotoPost {
  id: number;
  locationId: number;
  userId: number;
  userName: string;
  userAvatar: string;
  image: string;
  caption: string;
  likes: number;
  date: string;
}

export enum LocationCategory {
  CULTURAL = 'Cultural',
  NATURAL = 'Natural',
  ADVENTURE = 'Adventure',
  HISTORICAL = 'Historical',
  BEACH = 'Beach',
  FOOD = 'Food & Cuisine',
}

export enum Region {
  CENTRAL = 'Central Province',
  NORTH = 'Northern Province',
  SOUTH = 'Southern Province',
  EAST = 'Eastern Province',
  WEST = 'Western Province',
  NORTHWEST = 'North Western Province',
  NORTHCENTRAL = 'North Central Province',
  UVA = 'Uva Province',
  SABARAGAMUWA = 'Sabaragamuwa Province',
}

// Mock Locations
export const mockLocations: Location[] = [
  {
    id: 1,
    name: 'Temple of the Tooth',
    description: 'The Temple of the Sacred Tooth Relic is a Buddhist temple located in Kandy, Sri Lanka. It houses the relic of the tooth of Buddha.',
    latitude: 7.2936,
    longitude: 80.6413,
    image: 'https://images.unsplash.com/photo-1625044009755-2d9fa665d248?q=80&w=2942&auto=format&fit=crop',
    points: 100,
    category: LocationCategory.CULTURAL,
    region: Region.CENTRAL,
    unlocked: false,
    facts: [
      'Built during the 17th century',
      'Part of the UNESCO World Heritage Site',
      'Houses the relic of the tooth of the Buddha',
      'The sacred tooth relic has played an important role in local politics since ancient times',
    ]
  },
  {
    id: 2,
    name: 'Sigiriya Rock Fortress',
    description: 'Ancient rock fortress with frescoes and landscaped gardens. One of Sri Lanka\'s most iconic sites.',
    latitude: 7.9570,
    longitude: 80.7603,
    image: 'https://images.unsplash.com/photo-1583465781141-aa21cd602bdf?q=80&w=2833&auto=format&fit=crop',
    points: 150,
    category: LocationCategory.HISTORICAL,
    region: Region.CENTRAL,
    unlocked: false,
    facts: [
      'Built by King Kashyapa during the 5th century',
      'Also known as Lion Rock due to the huge lion paws at the entrance',
      'Features ancient frescoes of celestial nymphs',
      'The site includes water gardens, boulder gardens, and terraced gardens'
    ]
  },
  {
    id: 3,
    name: 'Galle Fort',
    description: 'A UNESCO World Heritage Site, this fortified old city was founded by Portuguese colonists in the 16th century.',
    latitude: 6.0300,
    longitude: 80.2167,
    image: 'https://images.unsplash.com/photo-1575891465383-5c5106a2cfcd?q=80&w=2649&auto=format&fit=crop',
    points: 120,
    category: LocationCategory.HISTORICAL,
    region: Region.SOUTH,
    unlocked: false,
    facts: [
      'Originally built by the Portuguese in 1588',
      'Later fortified by the Dutch during the 17th century',
      'One of the best preserved colonial sea forts in Asia',
      'Contains a unique blend of European architecture and South Asian traditions'
    ]
  },
  {
    id: 4,
    name: 'Yala National Park',
    description: 'Sri Lanka\'s most famous wildlife park, known for having one of the highest leopard densities in the world.',
    latitude: 6.3735,
    longitude: 81.5089,
    image: 'https://images.unsplash.com/photo-1670237735425-b36cca484e2a?q=80&w=2672&auto=format&fit=crop',
    points: 130,
    category: LocationCategory.NATURAL,
    region: Region.SOUTH,
    unlocked: true,
    facts: [
      'Has one of the highest leopard densities in the world',
      'Home to 44 varieties of mammals and 215 bird species',
      'Covers 979 square kilometers of land',
      'Divided into 5 blocks, with only 2 open to the public'
    ]
  },
  {
    id: 5,
    name: 'Mirissa Beach',
    description: 'A stunning beach known for surfing, whale watching, and relaxed atmosphere.',
    latitude: 5.9483,
    longitude: 80.4567,
    image: 'https://images.unsplash.com/photo-1586047527725-f653d576dfde?q=80&w=2090&auto=format&fit=crop',
    points: 90,
    category: LocationCategory.BEACH,
    region: Region.SOUTH,
    unlocked: true,
    facts: [
      'One of the best spots for whale watching in Sri Lanka',
      'Known for its calm, crescent-shaped sandy beach',
      'Popular for both surfing and relaxation',
      'Has a distinctive coconut tree hill lookout point'
    ]
  },
];

// Mock Users for Leaderboard
export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Sarah Thompson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    points: 870,
    rank: 1,
    locationsUnlocked: 12,
    joinDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Raj Patel',
    avatar: 'https://i.pravatar.cc/150?img=2',
    points: 760,
    rank: 2,
    locationsUnlocked: 10,
    joinDate: '2023-02-20',
  },
  {
    id: 3,
    name: 'Emma Wilson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    points: 695,
    rank: 3,
    locationsUnlocked: 9,
    joinDate: '2023-03-11',
  },
  {
    id: 4,
    name: 'Miguel Santos',
    avatar: 'https://i.pravatar.cc/150?img=4',
    points: 580,
    rank: 4,
    locationsUnlocked: 8,
    joinDate: '2023-01-30',
  },
  {
    id: 5,
    name: 'Aiko Tanaka',
    avatar: 'https://i.pravatar.cc/150?img=5',
    points: 540,
    rank: 5,
    locationsUnlocked: 7,
    joinDate: '2023-04-05',
  },
];

// Mock Photo Posts
export const mockPhotoPosts: PhotoPost[] = [
  {
    id: 1,
    locationId: 4,
    userId: 2,
    userName: 'Raj Patel',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    image: 'https://images.unsplash.com/photo-1633933769353-7908511c96bd?q=80&w=2787&auto=format&fit=crop',
    caption: 'Spotted a leopard at Yala! Incredible experience. #WildlifeSafari',
    likes: 42,
    date: '2023-07-15',
  },
  {
    id: 2,
    locationId: 5,
    userId: 1,
    userName: 'Sarah Thompson',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    image: 'https://images.unsplash.com/photo-1562554404-1ac0636abbc9?q=80&w=2787&auto=format&fit=crop',
    caption: 'Perfect sunset at Mirissa Beach. The colors were unreal! #SriLankaBeaches',
    likes: 65,
    date: '2023-07-12',
  },
  {
    id: 3,
    locationId: 4,
    userId: 3,
    userName: 'Emma Wilson',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    image: 'https://images.unsplash.com/photo-1674650650087-700df2f08701?q=80&w=2942&auto=format&fit=crop',
    caption: 'Early morning safari at Yala. The wildlife is incredible here! #SriLankaSafari',
    likes: 37,
    date: '2023-07-10',
  },
];

// Generate Current User 
export const currentUser: User = {
  id: 6,
  name: 'Guest Explorer',
  avatar: 'https://i.pravatar.cc/150?img=8',
  points: 220,
  rank: 15,
  locationsUnlocked: 2,
  joinDate: '2023-06-20',
};
