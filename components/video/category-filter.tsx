"use client"

import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CategoryFilterProps {
  currentCategory?: string
}

export function CategoryFilter({ currentCategory }: CategoryFilterProps) {
  const router = useRouter()

  const categories = [
    { id: "", name: "All" },
    { id: "education", name: "Education" },
    { id: "entertainment", name: "Entertainment" },
    { id: "business", name: "Business" },
    { id: "technology", name: "Technology" },
    { id: "health", name: "Health" },
    { id: "lifestyle", name: "Lifestyle" },
  ]

  const handleCategoryChange = (category: string) => {
    if (category) {
      router.push(`/videos?category=${category}`)
    } else {
      router.push("/videos")
    }
  }

  return (
    <div className="flex justify-start overflow-auto pb-2">
      <Tabs value={currentCategory || ""} onValueChange={handleCategoryChange} className="w-full">
        <TabsList className="w-full justify-start">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="px-4">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}

