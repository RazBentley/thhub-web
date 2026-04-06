export type UserRole = 'owner' | 'client';

export interface OnboardingInfo {
  mainGoal?: string;
  motivation?: string;
  experience?: string;
  trainingDays?: string;
  healthConditions?: string;
  dietaryRequirements?: string;
  additionalNotes?: string;
  completedAt?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  checkInDay: string;
  fcmToken?: string;
  createdAt: number;
  photoURL?: string;
  onboarding?: OnboardingInfo;
}

export interface Subscription {
  status: 'active' | 'inactive' | 'past_due' | 'cancelled';
  stripeCustomerId?: string;
  currentPeriodEnd?: number;
  plan: string;
  amount: number;
}

export interface FoodEntry {
  id: string;
  foodName: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  quantity: number;
  timestamp: number;
}

export interface DailyFoodLog {
  date: string;
  entries: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Chat {
  id: string;
  participants: string[];
  clientName: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  timestamp: number;
  read: boolean;
}

export interface MealItem {
  label: string;
  items: string[];
  note?: string;
  estimatedCalories?: number;
  estimatedProtein?: number;
  estimatedCarbs?: number;
  estimatedFat?: number;
}

export interface MealPlan {
  freeCalories: number;
  waterTargetLitres: number;
  meals: MealItem[];
  optionalSnack?: string;
  notes: string[];
  supplements: string[];
  updatedAt: number;
}

export interface ExtraFoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  mealLabel?: string;
}

export interface DailyProgress {
  mealsCompleted: boolean[];
  waterGlasses: number;
  extras: ExtraFoodItem[];
  completedAt?: number;
}

export interface WeeklyCheckIn {
  submittedAt: number;
  weekId: string;
  weightCurrent: string;
  weightPrevious: string;
  goal: string;
  sleep: string;
  appetite: string;
  energy: string;
  stress: string;
  gymPerformance: string;
  recovery: string;
  sessionsCompleted: boolean;
  cardio: string;
  steps: string;
  adherence: string;
  cheatMeal: string;
  questions: string;
  otherNotes: string;
  wins: string;
  goalsNextWeek: string;
  frontPhotoUrl?: string;
  sidePhotoUrl?: string;
  backPhotoUrl?: string;
}

export interface DailyCardio {
  date: string;
  cardioMinutes: number;
  cardioType: string;
  steps: number;
  notes?: string;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutDay {
  label: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutProgramme {
  name: string;
  days: WorkoutDay[];
  notes: string[];
  updatedAt: number;
}

export interface ExerciseLog {
  weight?: string;
  notes?: string;
}

export interface WorkoutProgress {
  date: string;
  dayLabel: string;
  exercisesCompleted: boolean[];
  exerciseLogs?: ExerciseLog[];
  completedAt?: number;
}

export interface WeightGoal {
  targetWeight: string;
  targetDate: string;
  startWeight: string;
  startDate: string;
  unit: 'st' | 'kg';
}

export interface OpenFoodFactsProduct {
  code: string;
  product_name: string;
  brands?: string;
  nutriments: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    'energy-kcal_serving'?: number;
    proteins_serving?: number;
    carbohydrates_serving?: number;
    fat_serving?: number;
  };
  serving_size?: string;
  image_url?: string;
}
