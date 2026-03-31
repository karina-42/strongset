import type { VideoWorkout } from "../db/models/VideoWorkout"
import { useState } from "react"

interface VideoListProps {
  videoWorkouts: VideoWorkout[]
  onEdit: (updatedVideo: VideoWorkout) => void
  onDelete: (id: string) => void
}

export function VideoList({
  videoWorkouts,
  onEdit,
  onDelete
}: VideoListProps) {
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<VideoWorkout | null>(null)
  const [tagsInput, setTagsInput] = useState("")

  const repeatFlagColors = {
    "do-again": "bg-green-50 border border-green-200",
    "neutral": "bg-white border border-gray-200",
    "dont-do-again": "bg-red-50 border border-red-200"
  }

  const sortedVideos = [...videoWorkouts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return ( 
    <div className="space-y-3">
      <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Videos</h2>
      {sortedVideos.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-4">No videos yet!</p>
      )}
      {sortedVideos.map(video => (
        <div key={video.id} className={`rounded-xl p-3 shadow-sm ${repeatFlagColors[video.repeatFlag]}`}>
          <div className="flex gap-3 items-start">
            {video.thumbnailUrl && (
              <img src={video.thumbnailUrl} className='w-24 rounded-lg flex-shrink-0' />
            )}
            <div className="flex-1 min-w-0">
              <a href={video.url} target='_blank' rel='noopener noreferrer'
                className="font-semibold text-purple-700 text-sm leading-tight line-clamp-2">
                {video.title || "Untitled video"}
              </a>
              {video.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-1">
                  {video.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )} 
              {video.note && <p className="text-gray-500 text-xs mt-1">{video.note}</p>}
              <p className="text-gray-400 text-sm mt-1">
                {new Date(video.createdAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (editingVideoId === video.id) {
                  setEditingVideoId(null)
                  setEditDraft(null)
                } else {
                  setEditingVideoId(video.id)
                  setEditDraft(video)
                  setTagsInput(video.tags.join(", "))
                }
              }}
              className="text-xs text-blue-500 underline mt-2"
            >
              {editingVideoId === video.id ? "Cancel" : "Edit"}
            </button>
          </div>
          {editingVideoId === video.id && editDraft && (
            <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
              {/* title */}
              <input
                value={editDraft.title}
                onChange={e => setEditDraft({...editDraft, title: e.target.value})}
                className="w-full border rounded-lg p-2 text-sm bg-white"
                placeholder="Title"
              />
              {/* tags */}
              <input 
                value={tagsInput}
                onChange={ e => setTagsInput(e.target.value)}
                onBlur={e => setEditDraft({...editDraft, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})}
                className="w-full border rounded-lg p-2 text-sm bg-white"
                placeholder="Tags (comma separated)"
              />
              {/* notes */}
              <textarea
                placeholder="Notes"
                value={editDraft.note}
                onChange={e => setEditDraft({...editDraft, note: e.target.value})}
                className="w-full border rounded-lg p-2 text-sm bg-white min-h-[60px]"
              />
              {/* repeatFlag */}
              <div className="flex gap-2 flex-wrap">
                {([
                  { value: "do-again", label: "Do again"},
                  { value: "neutral", label: "It was ok"},
                  { value: "dont-do-again", label: "Never again"},
                ] as const).map(option => (
                  <button
                    key={option.value}
                    onClick={() => setEditDraft({...editDraft, repeatFlag: option.value})}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      editDraft.repeatFlag === option.value
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {/* area */}
              <div className="flex gap-2 flex-wrap">
                {(["upper", "lower", "full"] as const).map(area => (
                  <button
                    key={area} 
                    onClick={() => setEditDraft({...editDraft, area})}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      editDraft.area === area
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
              {/* save cancel delete buttons */}
              <div className="flex gap-2 justify-between mt-2">
                <button
                  onClick={() => onDelete(video.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm"
                >
                  Delete
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingVideoId(null); setEditDraft(null) }}
                    className="bg-gray-400 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() =>{ onEdit(editDraft); setEditingVideoId(null); setEditDraft(null) }}
                    className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div> 
  )
}
