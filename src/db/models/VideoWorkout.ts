export type RepeatFlag = "do-again" | "neutral" | "dont-do-again"

export type VideoWorkout = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  note?: string;
  area: "upper" | "lower" | "core" | "full";
  repeatFlag: RepeatFlag
  createdAt: Date
}