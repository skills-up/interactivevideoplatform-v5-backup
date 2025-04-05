"use client"

import { useState } from "react"
import { ChevronDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function VideoFilter() {
  const [showInteractive, setShowInteractive] = useState(false)
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "oldest">("recent")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filter</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filter Videos</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Video Type</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={showInteractive} onCheckedChange={setShowInteractive}>
          Interactive Only
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Sort By</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={sortBy === "recent"}
          onCheckedChange={(checked) => {
            if (checked) setSortBy("recent")
          }}
        >
          Most Recent
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={sortBy === "popular"}
          onCheckedChange={(checked) => {
            if (checked) setSortBy("popular")
          }}
        >
          Most Popular
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={sortBy === "oldest"}
          onCheckedChange={(checked) => {
            if (checked) setSortBy("oldest")
          }}
        >
          Oldest First
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

