import type { DraftEntryInput } from "../types"

type DraftEntryFormProps = {
  value: DraftEntryInput;
  lastDoneDate: Date | null
  onChange: (value: DraftEntryInput) => void;
  onSubmit: () => void;
}

export function DraftEntryForm({
  value,
  lastDoneDate,
  onChange,
  onSubmit,
}: DraftEntryFormProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
      <h1>Selected Exercise</h1>

      {/* Display name and date last done*/}
      <p>{value.exerciseName}, {lastDoneDate ? ( <span>last done {lastDoneDate.toLocaleString()} </span>) : (<span>first time</span>)}</p>

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
      
      {/* weight in kg*/}
      <div className="space-y-2">
        <label className="text-sm text-gray-600">Weight:</label>
        <input 
          className="w-full border rounded-lg p-2"
          type="number" 
          value={value.weight ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              weight: e.target.value === "" ? null : Number(e.target.value)
            })
          }
          />kg x 
        </div>

      {/* number of weights */}
      <div>
        <label className="text-sm text-gray-600">Number of weights:</label>
        <input 
          className="w-full border rounded-lg p-2"
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
      <br />
            
      {/* reps */}
      <div>
        <label className="text-sm text-gray-600">Reps:</label>
        <input 
          className="w-full border rounded-lg p-2"
          type="number" 
          value={value.reps ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              reps: e.target.value === "" ? null : Number(e.target.value)
            })
          }
        /> reps x 
      </div>

      {/* sets */}
      <div>
        <label className="text-sm text-gray-600">Sets:</label>
        <input 
          className="w-full border rounded-lg p-2"
          type="number" 
          value={value.sets}
          onChange={(e) =>
            onChange({
              ...value,
              sets: Number(e.target.value)
            })
          }
        /> sets
      </div>

      {/* Note */}
      <div>
        <label className="text-sm text-gray-600">Notes:</label>
        <input 
          className="w-full border rounded-lg p-2"
          type="text" 
          value={value.note}
          placeholder='enter note'
          onChange={(e) =>
            onChange({
              ...value,
              note: e.target.value
            })
          }
        />
      </div>
      <br />

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
        <br /> 
      </div>

      <fieldset>
        <legend>Body area</legend>
        <div className="space-y-2">
          {(["upper", "lower", "full"] as const).map(area => (
                <label key={area} className="fles items-center gap-3 p-2 rounded-lg border">
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
                  {area}
                </label>
              ))}
        </div>
      </fieldset>
        
      {/* Click and save the draft into today's entries */}
      <button onClick={onSubmit} className="
      w-full
      bg-blue-600
      text-white
      py-3
      rounded-xl
      font-semibold
      active:scale-95
      ">Add Entry</button>
    </div>
  )
}
