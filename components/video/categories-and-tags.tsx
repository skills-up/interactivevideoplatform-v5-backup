"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Tag, Hash, ChevronRight } from "lucide-react"
import Link from "next/link"

interface CategoriesAndTagsProps {
  selectedCategory?: string
  selectedTag?: string
  onCategoryChange?: (category: string) => void
  onTagChange?: (tag: string) => void
  className?: string
}

export function CategoriesAndTags({
  selectedCategory,
  selectedTag,
  onCategoryChange,
  onTagChange,
  className,
}: CategoriesAndTagsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [popularTags, setPopularTags] = useState<any[]>([])
  const [categoryTags, setCategoryTags] = useState<any[]>([])
  const { toast } = useToast()

  // Fetch categories and popular tags
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      setIsLoading(true)

      try {
        const [categoriesResponse, tagsResponse] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/tags/popular"),
        ])

        if (!categoriesResponse.ok || !tagsResponse.ok) {
          throw new Error("Failed to fetch categories or tags")
        }

        const categoriesData = await categoriesResponse.json()
        const tagsData = await tagsResponse.json()

        setCategories(categoriesData.categories || [])
        setPopularTags(tagsData.tags || [])
      } catch (error) {
        console.error("Error fetching categories and tags:", error)
        toast({
          title: "Error",
          description: "Failed to load categories and tags",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategoriesAndTags()
  }, [toast])

  // Fetch tags for selected category
  useEffect(() => {
    const fetchCategoryTags = async () => {
      if (!selectedCategory) {
        setCategoryTags([])
        return
      }

      try {
        const response = await fetch(`/api/categories/${selectedCategory}/tags`)

        if (!response.ok) {
          throw new Error("Failed to fetch category tags")
        }

        const data = await response.json()
        setCategoryTags(data.tags || [])
      } catch (error) {
        console.error("Error fetching category tags:", error)
        toast({
          title: "Error",
          description: "Failed to load tags for this category",
          variant: "destructive",
        })
      }
    }

    fetchCategoryTags()
  }, [selectedCategory, toast])

  const handleCategoryClick = (category: any) => {
    if (onCategoryChange) {
      onCategoryChange(category.slug)
    }
  }

  const handleTagClick = (tag: string) => {
    if (onTagChange) {
      onTagChange(tag)
    }
  }

  return (
    <div className={className}>
      {/* Categories */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Hash className="h-5 w-5 mr-2" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <ScrollArea className="whitespace-nowrap pb-4">
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <Button
                    key={category.slug}
                    variant={selectedCategory === category.slug ? "default" : "outline"}
                    className="flex items-center"
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category.icon && <span className="mr-2">{category.icon}</span>}
                    {category.name}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Popular Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge
                  key={tag.name}
                  variant={selectedTag === tag.name ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => handleTagClick(tag.name)}
                >
                  {tag.name}
                  <span className="ml-1 text-xs opacity-70">({tag.count})</span>
                </Badge>
              ))}
            </div>
          )}

          {selectedCategory && categoryTags.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Tags in this category:</h4>
              <div className="flex flex-wrap gap-2">
                {categoryTags.map((tag) => (
                  <Badge
                    key={tag.name}
                    variant={selectedTag === tag.name ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => handleTagClick(tag.name)}
                  >
                    {tag.name}
                    <span className="ml-1 text-xs opacity-70">({tag.count})</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <Link href="/tags">
              <Button variant="link" className="p-0 h-auto text-sm">
                View all tags
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

