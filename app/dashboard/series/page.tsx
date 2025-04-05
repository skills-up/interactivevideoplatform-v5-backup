"use client"

import { RequireAuth } from "@/components/auth/require-auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Permission } from "@/lib/auth/permissions"
import { formatDistanceToNow } from "date-fns"
import { Edit, Eye, Film, MoreHorizontal, Plus, Trash } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface SeriesData {
  _id: string
  title: string
  thumbnail: string
  price: number
  subscribers: number
  createdAt: string
  isActive: boolean
}

export default function SeriesPage() {
  const [series, setSeries] = useState<SeriesData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // In a real app, you would fetch series from your API
    // const fetchSeries = async () => {
    //   const response = await fetch('/api/series/my-series');
    //   const data = await response.json();
    //   setSeries(data);
    //   setLoading(false);
    // };

    // Simulate API call with mock data
    setTimeout(() => {
      const mockSeries = [
        {
          _id: "1",
          title: "Learn React from Scratch",
          thumbnail: "/placeholder.svg?height=48&width=80",
          price: 9.99,
          subscribers: 245,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
        },
        {
          _id: "2",
          title: "Advanced Cooking Techniques",
          thumbnail: "/placeholder.svg?height=48&width=80",
          price: 7.99,
          subscribers: 120,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
        },
        {
          _id: "3",
          title: "Web Development Masterclass",
          thumbnail: "/placeholder.svg?height=48&width=80",
          price: 12.99,
          subscribers: 310,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
        },
      ] as SeriesData[]

      setSeries(mockSeries)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredSeries = series.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <RequireAuth permission={Permission.CREATE_SERIES}>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="container flex-1 px-4 py-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <DashboardSidebar />
            <main className="flex-1">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">My Series</h1>
                <Link href="/dashboard/series/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Series
                  </Button>
                </Link>
              </div>

              <div className="mb-6">
                <Input
                  placeholder="Search series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>

              {loading ? (
                <div className="rounded-md border">
                  <div className="p-4">
                    <Skeleton className="h-8 w-full max-w-md" />
                  </div>
                  <div className="divide-y">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4">
                          <Skeleton className="h-12 w-20 rounded" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full max-w-md" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      ))}
                  </div>
                </div>
              ) : filteredSeries.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Series</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead className="hidden md:table-cell">Price</TableHead>
                        <TableHead className="hidden md:table-cell">Subscribers</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSeries.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-20 overflow-hidden rounded-md">
                                <img
                                  src={item.thumbnail || "/placeholder.svg"}
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium">{item.title}</div>
                                <div className="md:hidden text-xs text-muted-foreground">
                                  ${item.price.toFixed(2)}/month • {item.subscribers} subscribers
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">${item.price.toFixed(2)}/month</TableCell>
                          <TableCell className="hidden md:table-cell">{item.subscribers}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center">
                              <span
                                className={`mr-2 h-2 w-2 rounded-full ${item.isActive ? "bg-green-500" : "bg-red-500"}`}
                              ></span>
                              <span>{item.isActive ? "Active" : "Inactive"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/series/${item._id}`}
                                    className="flex w-full cursor-pointer items-center"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>View</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/dashboard/series/edit/${item._id}`}
                                    className="flex w-full cursor-pointer items-center"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/dashboard/series/${item._id}/seasons`}
                                    className="flex w-full cursor-pointer items-center"
                                  >
                                    <Film className="mr-2 h-4 w-4" />
                                    <span>Manage Seasons</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex h-[40vh] items-center justify-center rounded-lg border border-dashed">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold">No series found</h2>
                    <p className="text-muted-foreground">
                      {searchQuery ? "Try a different search term" : "Get started by creating your first series"}
                    </p>
                    {!searchQuery && (
                      <Link href="/dashboard/series/create" className="mt-4 inline-block">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Series
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}

