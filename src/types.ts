
export enum MuscleGroup {
  CHEST = 'Peitoral',
  BACK = 'Costas',
  LEGS = 'Pernas',
  SHOULDERS = 'Ombros',
  ARMS = 'Braços',
  CORE = 'Abdômen',
  CARDIO = 'Cardio',
  FULL_BODY = 'Corpo Todo'
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: string;
  videoUrl?: string;
  notes?: string;
}

export interface DayPlan {
  dayOfWeek: string;
  exercises: Exercise[];
  focus: string;
}

export interface WeeklyPlan {
  days: DayPlan[];
  generatedAt?: string;
}

export interface YogaPose {
  name: string;
  duration: string;
  description: string;
  benefits: string;
}

export interface YogaPlan {
  name: string;
  level: string;
  duration: number; // minutes
  poses: YogaPose[];
  generatedAt?: string;
}

export interface Measurements {
  chest?: number;
  waist?: number;
  hips?: number;
  bicepsL?: number;
  bicepsR?: number;
  thighL?: number;
  thighR?: number;
  neck?: number;
  forearm?: number;
  calf?: number;
}

export interface ProgressEntry {
  id: string;
  date: string;
  weight: number;
  measurements: Measurements;
  photos: string[];
  aiInsights?: string;
}

export interface Meal {
  time: string;
  label: string;
  description: string;
}

export interface DayNutriPlan {
  dayOfWeek: string;
  meals: Meal[];
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string;
  macros: { protein: number; carbs: number; fats: number; calories: number };
}

export interface ShoppingItem {
  item: string;
  category: string;
  checked: boolean;
}

export interface NutriPlan {
  weeklyMeals: DayNutriPlan[];
  recipes: Recipe[];
  shoppingList: ShoppingItem[];
  dailyMacrosTarget: { protein: number; carbs: number; fats: number; calories: number };
}

export interface MeditationChallenge {
  title: string;
  description: string;
  completed: boolean;
}

export interface SportsDrill {
  name: string;
  duration: string;
  description: string;
  videoSearchQuery: string;
}

export interface SportsPlan {
  id: string;
  sport: string;
  weeklySchedule: { day: string, drills: SportsDrill[], focus: string }[];
  generatedAt?: string;
}

export interface CalisthenicsExercise {
  name: string;
  sets: number;
  reps: string;
  progression: string; // e.g., "Knee Pushups -> Regular Pushups"
  videoSearchQuery: string;
}

export interface CalisthenicsPlan {
  level: string;
  focusSkill: string; // e.g., "Muscle Up", "Planche", "Basics"
  routine: { day: string, exercises: CalisthenicsExercise[] }[];
  generatedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  sedentaryLevel: 'Sedentário' | 'Levemente Ativo' | 'Moderadamente Ativo' | 'Muito Ativo' | 'Atleta';
  goal: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  weeklyPlan: WeeklyPlan;
  workoutHistory?: WeeklyPlan[];
  nutriPlan?: NutriPlan;
  yogaPlan?: YogaPlan;
  yogaHistory?: YogaPlan[];
  sportsPlan?: SportsPlan;
  sportsHistory?: SportsPlan[];
  calisthenicsPlan?: CalisthenicsPlan;
  meditationChallenges: MeditationChallenge[];
  progress: ProgressEntry[];
  avatarUrl: string;
  restrictions?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  personalId?: string;
}

export interface TrainerProfile {
  name: string;
  cref?: string;
  title: string;
  bio: string;
  avatarUrl: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
}

export type ViewState = 'DASHBOARD' | 'STUDENT_DETAILS';
