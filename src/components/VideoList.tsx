import type { VideoWorkout } from "../db/models/VideoWorkout"

interface VideoListProps {
  videoWorkouts: VideoWorkout[]
}

export function VideoList({
  videoWorkouts,
}: VideoListProps) {
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
        </div>
      ))}
    </div> 
  )
}
