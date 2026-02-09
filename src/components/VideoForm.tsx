import type { DraftVideoWorkout } from "../types"

type VideoFormProps = {
  value: DraftVideoWorkout
  onChange: (next: DraftVideoWorkout) => void
  onSubmit: () => void
}

export function VideoForm({
  value,
  onChange,
  onSubmit
}: VideoFormProps) {
  return (
    <div className="flex flex-col gap-2">
      <input
        type="url"
        placeholder="Paste YouTube link"
        value={value.url}
        onChange={e =>
          onChange({ ...value, url: e.target.value })
        }
        className="border p-2 rounded"
      />

      {value.thumbnailUrl && (
        <img
          src={value.thumbnailUrl}
          alt={value.title}
          className="w-64 rounded"
        />
      )}

      <input
        value={value.title}
        placeholder="title"
        onChange={e =>
          onChange({ ...value, title: e.target.value })
        }
        className="border p-2 rounded bg-gray-100"
      />  
      
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

      <fieldset>
        <legend>Repeat?</legend>
        <div className="space-y-2">
          {(
            [
              { value: "do-again", label: "Do again"},
              { value: "neutral", label: "It was ok"},
              { value: "dont-do-again", label: "Never again"},
            ] as const
          ).map(option => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-2 rounded-lg border cursor-pointer"
            >
              <input
                type="radio"
                name="repeatFlag"
                value={option.value}
                checked={value.repeatFlag === option.value}
                onChange={() =>
                  onChange({
                    ...value,
                    repeatFlag: option.value,
                  })
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <textarea
        placeholder="Notes (why I liked or didn't liked)"
        value={value.note}
        onChange={e =>
          onChange({...value, note: e.target.value})
        }
      ></textarea>

      <input 
        placeholder="Tags (comma separated)"
        value={value.tags.join(", ")}
        onChange={ e => 
          onChange({
            ...value,
            tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean),
          })
        }
      />

      <button 
        onClick={onSubmit} 
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Save video
      </button>
    </div>
  )
}