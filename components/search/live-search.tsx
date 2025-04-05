"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "@/hooks/use-debounce"
import { SearchIcon, X, Video, User, Tag, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface LiveSearchProps {
  placeholder?: string
  className?: string
}

export function LiveSearch({ placeholder = "Search videos, creators, tags...", className }: LiveSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>({
    videos: [],
    creators: [],
    tags: [],
    recentSearches: [],
  })
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Load recent searches from localStorage
  useEffect(() => {
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]")
    setResults((prev) => ({ ...prev, recentSearches }))
  }, [])

  // Fetch search results when query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearchQuery.trim()) {
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      setIsOpen(true)

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchQuery)}`)
        if (!response.ok) throw new Error("Search failed")

        const data = await response.json()
        setResults((prev) => ({
          ...prev,
          videos: data.videos || [],
          creators: data.creators || [],
          tags: data.tags || [],
        }))
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearchResults()
  }, [debouncedSearchQuery])

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    // Save to recent searches
    const recentSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]")
    const updatedSearches = [searchQuery, ...recentSearches.filter((s: string) => s !== searchQuery)].slice(0, 5)

    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))

    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    setIsOpen(false)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={clearSearch}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full mt-1 w-full z-50 shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {/* Videos */}
                {results.videos.length > 0 && (
                  <div className="p-2">
                    <h3 className="text-sm font-medium px-2 py-1">Videos</h3>
                    <div className="space-y-1">
                      {results.videos.slice(0, 3).map((video: any) => (
                        <Link
                          key={video.id}
                          href={`/watch/${video.id}`}
                          className="flex items-center p-2 rounded-md hover:bg-muted transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="h-10 w-16 bg-muted rounded overflow-hidden mr-3 flex-shrink-0">
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl || "/placeholder.svg"}
                                alt={video.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Video className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{video.title}</p>
                            <p className="text-xs text-muted-foreground">{video.views} views</p>
                          </div>
                        </Link>
                      ))}
                      {results.videos.length > 3 && (
                        <Button variant="ghost" className="w-full text-xs" onClick={handleSearch}>
                          View all {results.videos.length} videos
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Creators */}
                {results.creators.length > 0 && (
                  <div className="p-2">
                    <h3 className="text-sm font-medium px-2 py-1">Creators</h3>
                    <div className="space-y-1">
                      {results.creators.slice(0, 3).map((creator: any) => (
                        <Link
                          key={creator.id}
                          href={`/channel/${creator.id}`}
                          className="flex items-center p-2 rounded-md hover:bg-muted transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="h-10 w-10 rounded-full overflow-hidden mr-3 flex-shrink-0 bg-muted">
                            {creator.avatarUrl ? (
                              <img
                                src={creator.avatarUrl || "/placeholder.svg"}
                                alt={creator.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{creator.name}</p>
                            <p className="text-xs text-muted-foreground">{creator.subscriberCount} subscribers</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {results.tags.length > 0 && (
                  <div className="p-2">
                    <h3 className="text-sm font-medium px-2 py-1">Tags</h3>
                    <div className="flex flex-wrap gap-2 p-2">
                      {results.tags.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            setSearchQuery(tag)
                            handleSearch()
                          }}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent searches */}
                {results.recentSearches.length > 0 && !searchQuery && (
                  <div className="p-2">
                    <h3 className="text-sm font-medium px-2 py-1">Recent Searches</h3>
                    <div className="space-y-1">
                      {results.recentSearches.map((search: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center p-2 rounded-md hover:bg-muted transition-colors cursor-pointer"
                          onClick={() => {
                            setSearchQuery(search)
                            handleSearch()
                          }}
                        >
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{search}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {searchQuery &&
                  results.videos.length === 0 &&
                  results.creators.length === 0 &&
                  results.tags.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">No results found for "{searchQuery}"</div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

