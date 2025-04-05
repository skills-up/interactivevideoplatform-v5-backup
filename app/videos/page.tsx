import type { Metadata } from "next"
import { getPublicVideos } from "@/lib/videos"
import { VideoCard } from "@/components/video/video-card"
import { Pagination } from "@/components/ui/pagination"
import { CategoryFilter } from "@/components/video/category-filter"

interface VideosPageProps {
  searchParams: {
    page?: string
    category?: string
  }
}

export const metadata: Metadata = {
  title: "Videos | Interactive Video Platform",
  description: "Browse interactive videos from our community",
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const { page, category } = await searchParams
  const pageNum = page ? Number.parseInt(page) : 1
  const pageSize = 12

  const { videos, totalCount } = await getPublicVideos(pageSize, pageNum, category)
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Videos</h1>
          <p className="text-muted-foreground">Browse interactive videos from our community</p>
        </div>

        <CategoryFilter currentCategory={category} />

        {videos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={pageNum}
                totalPages={totalPages}
                baseUrl={`/videos${category ? `?category=${category}&` : "?"}`}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-xl font-semibold">No videos found</h2>
            <p className="text-muted-foreground mt-2">
              {category ? `No videos found in the "${category}" category` : "No videos available at the moment"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

