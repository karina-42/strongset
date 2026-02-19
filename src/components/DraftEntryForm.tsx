import { useState } from "react";
import type { DraftEntryInput } from "../types"

type DraftEntryFormProps = {
  value: DraftEntryInput;
  lastDoneDate: Date | null;
  isEditing: boolean;
  onClear: () => void;
  onChange: (value: DraftEntryInput) => void;
  onSubmit: () => void;
}

export function DraftEntryForm({
  value,
  lastDoneDate,
  isEditing,
  onClear,
  onChange,
  onSubmit,
}: DraftEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className="bg-gray-100 rounded-xl p-4 shadow-sm space-y-4" id="exercise-form">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-emerald-700">Selected Exercise</h2>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 bg-gray-400 text-white rounded active:bg-gray-500 text-sm"
            onClick={onClear}
          >
            Clear
          </button>
          <button
            className="px-3 py-2 bg-emerald-500 text-white rounded active:bg-emerald-600 text-sm cursor-pointer"
            onClick={() => document.getElementById('exercise-browser')?.scrollIntoView({ behavior: 'smooth'})}
          >
            ↑ Select
          </button>
        </div>
      </div>

      {/* Display name and date last done*/}
      <p className="text-sm text-gray-600">
        {value.exerciseName}{lastDoneDate ? ( 
          <span>, last done {lastDoneDate.toLocaleDateString(undefined, {month: "short", day: "numeric", year: 'numeric'})} </span>
        ) : (
          <span>First time</span>
        )}
      </p>

      {/* Input exercise name */}
      <div className="space-y-2">
        <label className="text-sm text-gray-600">Exercise name:</label>
        <input 
          className="w-full border rounded-lg p-2"
          type="text" 
          value={value.exerciseName ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              exerciseName: e.target.value
            })
          }
        />
      </div>
      
      {/* weight in kg and number of weights*/}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Weight:</label>
          <div className="flex items-center gap-2">
            <input 
              className="w-16 border rounded-lg p-2 text-center"
              type="number" 
              value={value.weight ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  weight: e.target.value === "" ? null : Number(e.target.value)
                })
              }
              />
              <span className="text-gray-600">kg x</span>
          </div>
        </div> 
        <div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Number of weights:</label>
            <div className="flex items-center gap-2">
              <input
                className="w-16 border rounded-lg p-2 text-center"
                type="number"
                value={value.numOfWeights ?? ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    numOfWeights: e.target.value === "" ? null : Number(e.target.value)
                  })
                }
              />
            </div>
          </div>
        </div>       
      </div>

      {/* reps and sets*/}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Reps:</label>
          <div className="flex items-center gap-2">
            <input 
              className="w-16 border rounded-lg p-2 text-center"
              type="number" 
              value={value.reps ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  reps: e.target.value === "" ? null : Number(e.target.value)
                })
              }
            />
            <span className="text-gray-600">reps x</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Sets:</label>
          <div className="flex items-center gap-2">
            <input 
              className="w-16 border rounded-lg p-2 text-center"
              type="number" 
              value={value.sets}
              onChange={(e) =>
                onChange({
                  ...value,
                  sets: Number(e.target.value)
                })
              }
            /> 
            <span className="text-gray-600">sets</span>
          </div>
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="text-sm text-gray-600">Notes:</label>
        <textarea 
          className="w-full border rounded-lg p-2 min-h-[80px]"
          value={value.note}
          placeholder='enter note'
          rows={3}
          onChange={(e) =>
            onChange({
              ...value,
              note: e.target.value
            })
          }
        />
      </div>

      {/* rest time */}
      <div>
        <label className="text-sm text-gray-600">Rest Time:</label>
        <input 
          className="w-25 border rounded-lg p-2"
          type="number" 
          value={value.restMin}
          onChange={(e) =>
            onChange({
              ...value,
              restMin: Number(e.target.value)
            })
          }
        />:
        <input 
          className="w-25 border rounded-lg p-2"
          type="number" 
          value={value.restSec}
          onChange={(e) =>
            onChange({
              ...value,
              restSec: Number(e.target.value)
            })
          }
        />
      </div>
      
      {/* body area */}
      <fieldset className="border rounded-lg p-3">
        <legend className="text-sm font-medium text-gray-700 px-2">Body area</legend>
        <div className="flex gap-4">
          {(["upper", "lower", "full"] as const).map(area => (
            <label key={area} className="flex items-center gap-2">
              <input
                type="radio"
                name="area"
                value={area}
                checked={value.area === area}
                onChange={() => 
                  onChange({
                    ...value,
                    area,
                  })
                }
              />
              <span className="capitalize">{area}</span>
            </label>
          ))}
        </div>
      </fieldset>
        
      {/* Click and save the draft into today's entries */}
      <button 
        onClick={async () => {
          setIsSubmitting(true)
          await onSubmit()
          setIsSubmitting(false)
        }}
        className={`
          w-full
          ${isEditing ? 'bg-orange-500' : 'bg-emerald-500'}
          ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
          text-white
          py-3
          rounded-xl
          font-semibold
          active:scale-95
          cursor-pointer
        `}
      >
        {isSubmitting ? 'Adding...' : (isEditing ? "Update Entry" : "Add Entry")}
      </button>
    </div>
  )
}
