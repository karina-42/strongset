import type { TodayEntryDisplay } from "../types";

type TodayEntriesListProps = {
  entries: TodayEntryDisplay[];
  onEdit: (value: string) => void
  onDelete: (value: string) => void
}

export function TodayEntriesList({entries, onEdit, onDelete}: TodayEntriesListProps) {
  return (
    <div className="bg-gray-100 rounded-xl p-4 shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Today's Entries</h2>
      {entries.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No entries yet. Add your first exercise!</p>
      ) : (
        <ul className="space-y-3">
          {entries.map(entry => (
            <li key = {entry.id} className="border-b pb-2 mb-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p>{entry.exerciseName}: {entry.weight != null && entry.weight} kg x {entry.numOfWeights}, {entry.reps} reps x {entry.sets} sets</p>
                  {entry.note && <p className="text-sm text-gray-600">{entry.note}</p>}
                </div>
                <button
                  className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg active:bg-purple-600"
                  onClick={() => onEdit(entry.id)}
                  >
                    Edit
                  </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg active:bg-red-600 ml-2" 
                  onClick={() => onDelete(entry.id)}
                >
                  X
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
