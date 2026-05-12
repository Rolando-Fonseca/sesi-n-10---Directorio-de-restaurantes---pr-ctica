export const POINT_RULES = {
  REVIEW_CREATED: 10,
  REVIEW_WITH_PHOTOS: 20,
  PROFILE_COMPLETED: 50,
  WISHLIST_CREATED: 5,
  FIRST_REVIEW: 30,
} as const;

export const LEVEL_THRESHOLDS = [
  0,    // Level 1
  100,  // Level 2
  300,  // Level 3
  600,  // Level 4
  1000, // Level 5
  1500, // Level 6
  2500, // Level 7
  4000, // Level 8
  6000, // Level 9
  10000, // Level 10
];

export function calculateLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}
