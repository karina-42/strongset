import type { TodayEntryDisplay } from "../types";

type TodayEntriesListProps = {
  entries: TodayEntryDisplay[];
  onDelete: (value: string) => void
}

export function TodayEntriesList({entries, onDelete}: TodayEntriesListProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <ul>
        {entries.map(entry => (
          <li key = {entry.id} className="border-b pb-2 mb-2">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p>{entry.exerciseName}: {entry.weight != null && entry.weight} kg x {entry.numOfWeights}, {entry.reps} reps x {entry.sets} sets</p>
                {entry.note && <p className="text-sm text-gray-600">{entry.note}</p>}
              </div>
              <button
                className="text-red-500 font-bold text-xl ml-2" 
                onClick={() => onDelete(entry.id)}
              >
                X
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
