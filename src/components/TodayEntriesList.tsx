import type { TodayEntryDisplay } from "../types";

type TodayEntriesListProps = {
  entries: TodayEntryDisplay[];
}

export function TodayEntriesList({entries}: TodayEntriesListProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <ul>
        {entries.map(entry => (
          <li key = {entry.id}>
            <p>{entry.exerciseName}: {entry.weight != null && entry.weight} kg x {entry.numOfWeights}, {entry.reps} reps x {entry.sets} sets</p>
            <p>{entry.note}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
