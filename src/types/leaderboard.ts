
export interface LeaderboardUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  points: number;
  rank: number;
  locationsUnlocked: number;
}

export interface LeaderboardData {
  users: LeaderboardUser[];
  currentUser: LeaderboardUser | null;
}
