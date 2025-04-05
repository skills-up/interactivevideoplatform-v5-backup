import Link from "next/link"
import { VideoCard } from "@/components/video-card"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { SearchBar } from "@/components/search-bar"
import { VideoFilter } from "@/components/video-filter"

interface SearchPageProps {
  searchParams: Promise<{ q: string }>
}

async function searchVideos(query: string) {
  // In a real app, this would be an API call to your backend
  // For now, we'll simulate a search with mock data

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock data for demonstration
  const mockVideos = [
    {
      _id: "1",
      title: `Search result for "${query}" - Interactive Tutorial`,
      creator: { name: "Tech Tutorials" },
      thumbnail: "/placeholder.svg?height=200&width=350",
      views: 1240,
      createdAt: new Date().toISOString(),
      interactiveElements: [{ type: "quiz" }],
    },
    {
      _id: "2",
      title: `Learn about "${query}" with interactive elements`,
      creator: { name: "Education Channel" },
      thumbnail: "/placeholder.svg?height=200&width=350",
      views: 8750,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      interactiveElements: [{ type: "decision" }],
    },
    {
      _id: "3",
      title: `Advanced "${query}" techniques explained`,
      creator: { name: "Pro Tips" },
      thumbnail: "/placeholder.svg?height=200&width=350",
      views: 3420,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      interactiveElements: [],
    },
  ]

  return mockVideos
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || ""
  const videos = await searchVideos(query)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <MainNav />
            <SearchBar />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <button className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:block">
                Creator Dashboard
              </button>
            </Link>
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
              <p className="text-muted-foreground">
                {videos.length} results for "{query}"
              </p>
            </div>
            <VideoFilter />
          </div>

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  title={video.title}
                  creator={video.creator.name}
                  thumbnail={video.thumbnail}
                  views={video.views}
                  date={new Date(video.createdAt).toLocaleDateString()}
                  href={`/watch/${video._id}`}
                  interactive={video.interactiveElements.length > 0}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[40vh] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <h2 className="text-xl font-semibold">No results found</h2>
                <p className="text-muted-foreground">Try different keywords or check your spelling</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

