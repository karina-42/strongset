// Model for an exercise to store
// name of the exercise, its id, and what body part 
// it works 
export interface Exercise {
  name: string;
  id: string;
  area: "upper" | "lower" | "full";
}

// Model for an entry of a workout
// id of a random crypto number, the id of the exercise
// if it's in the database already, weight could be null 
// if it's bodyweight, in that case use notes, 
// numOfWeights could be number (0, 1, 2) or null for
// bodyweight, reps is number, explained in notes (14, 
// note: 7 each way), sets is number, restTime is number,
//note is string text, dateDone string now but using Date 
// later
export interface WorkoutEntry {
  id: string;
  exerciseId: string;
  weight: number | null;
  numOfWeights: number | null;
  reps: number | null;
  sets: number;
  restMin: number;
  restSec: number;
  note?: string;
  dateDone: Date;
}

// Display type to display the name of the exercise in 
// todayEntriesList
export type TodayEntryDisplay = WorkoutEntry & {
  exerciseName: string;
};

export type DraftEntryInput = {
  exerciseName: string;
  area: "upper" | "lower" | "full";
  weight: number | null;
  numOfWeights: number | null;
  reps: number | null;
  sets: number;
  restMin: number;
  restSec: number;
  note?: string;
}

export type AppMode = "gym" | "video";

export type VideoTab = "add" | "list" | "search" | "edit";

export type VideoWorkout = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  note?: string;
  area: "upper" | "lower" | "full";
}

export type DraftVideoWorkout = {
  title: string;
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  note?: string;
  area: "upper" | "lower" | "full";
}