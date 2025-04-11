import Link from "next/link"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTrendingSeries } from "@/lib/services/series-service"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { SearchBar } from "@/components/search-bar"

export default async function SeriesPage() {
  // Fetch more series for the series page
  const seriesList = await getTrendingSeries(9)

  return (
    <div className="container px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Series</h1>
        <p className="text-muted-foreground">Subscribe to series for premium interactive content</p>
      </div>

      {seriesList.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {seriesList.map((series, index) => (
            <Card key={series._id}>
              <CardContent className="p-0">
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <img
                    src={series.thumbnail || "/placeholder.svg?height=200&width=350"}
                    alt="Series thumbnail"
                    className="h-full w-full object-cover"
                  />
                  {index < 3 && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                      <span className="text-sm font-medium text-white">Trending #{index + 1}</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{series.title}</h3>
                  <p className="text-sm text-muted-foreground">{series.creator.name}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{series.seasons?.length || 0} Seasons</span>
                    <span>•</span>
                    <span>
                      {series.seasons?.reduce((total, season) => total + season.episodes.length, 0) || 0} Episodes
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0">
                <span className="text-sm font-medium">${series.price.toFixed(2)}/month</span>
                <Link href={`/series/${series._id}`}>
                  <Button size="sm" variant="outline">
                    View Series
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex h-[40vh] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <h2 className="text-xl font-semibold">No series found</h2>
            <p className="text-muted-foreground">Check back later for new content</p>
          </div>
        </div>
      )}
    </div>
  )
}

