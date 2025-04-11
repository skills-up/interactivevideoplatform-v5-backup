"use client"

import { RequireAuth } from "@/components/auth/require-auth"
import { LineChart } from "@/components/charts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Permission } from "@/lib/auth/permissions"
import { formatDistanceToNow } from "date-fns"
import { Mail, MoreHorizontal, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"

interface UserData {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  joinedAt: string
  lastActive: string
  subscribed: boolean
}

export default function AudiencePage() {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<UserData[]>([])
  const [subscriberGrowthData, setSubscriberGrowthData] = useState<any>(null)

  useEffect(() => {
    // In a real app, you would fetch users from your API
    // Simulate API call with mock data
    setTimeout(() => {
      const mockUsers = [
        {
          id: "1",
          name: "Alex Johnson",
          email: "alex@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "viewer",
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          subscribed: true,
        },
        {
          id: "2",
          name: "Sarah Williams",
          email: "sarah@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "viewer",
          joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          subscribed: true,
        },
        {
          id: "3",
          name: "Michael Brown",
          email: "michael@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "viewer",
          joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          subscribed: false,
        },
        {
          id: "4",
          name: "Emily Davis",
          email: "emily@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "viewer",
          joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          subscribed: true,
        },
        {
          id: "5",
          name: "David Wilson",
          email: "david@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
          role: "viewer",
          joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          subscribed: false,
        },
      ] as UserData[]

      setUsers(mockUsers)

      // Subscriber growth data
      const days = 30
      const labels = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - 1) + i)
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      })

      // Generate cumulative growth data
      let total = 120 // Starting with 120 subscribers
      const values = Array.from({ length: days }, () => {
        const newSubscribers = Math.floor(Math.random() * 10) + 1
        total += newSubscribers
        return total
      })

      setSubscriberGrowthData({
        labels: labels,
        datasets: [
          {
            label: "Total Subscribers",
            data: values,
            borderColor: "rgb(99, 102, 241)",
            backgroundColor: "rgba(99, 102, 241, 0.5)",
            tension: 0.3,
          },
        ],
      })

      setLoading(false)
    }, 1000)
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <RequireAuth permission={Permission.VIEW_USERS}>
        <main className="flex-1">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">Audience</h1>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Users
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{users.length}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{users.filter((user) => user.subscribed).length}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <div className="text-2xl font-bold">
                    {
                      users.filter((user) => {
                        const lastActive = new Date(user.lastActive)
                        const sevenDaysAgo = new Date()
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                        return lastActive >= sevenDaysAgo
                      }).length
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Subscriber Growth</CardTitle>
              <CardDescription>Total subscribers over time</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="aspect-[3/1] w-full rounded-lg bg-muted animate-pulse" />
              ) : (
                <LineChart data={subscriberGrowthData} />
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="all" className="mt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
                <TabsTrigger value="recent">Recently Active</TabsTrigger>
              </TabsList>

              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <TabsContent value="all" className="mt-4">
              {loading ? (
                <div className="space-y-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="hidden md:table-cell">Role</TableHead>
                        <TableHead className="hidden md:table-cell">Joined</TableHead>
                        <TableHead className="hidden md:table-cell">Last Active</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell capitalize">{user.role}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center">
                              <span
                                className={`mr-2 h-2 w-2 rounded-full ${
                                  user.subscribed ? "bg-green-500" : "bg-yellow-500"
                                }`}
                              ></span>
                              <span>{user.subscribed ? "Subscribed" : "Free"}</span>
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
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Message</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  <span>View Profile</span>
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
                    <h2 className="text-xl font-semibold">No users found</h2>
                    <p className="text-muted-foreground">Try a different search term</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="subscribers" className="mt-4">
              {loading ? (
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="hidden md:table-cell">Role</TableHead>
                        <TableHead className="hidden md:table-cell">Joined</TableHead>
                        <TableHead className="hidden md:table-cell">Last Active</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers
                        .filter((user) => user.subscribed)
                        .map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={user.avatar} alt={user.name} />
                                  <AvatarFallback>
                                    {user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell capitalize">{user.role}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
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
                                  <DropdownMenuItem>
                                    <Mail className="mr-2 h-4 w-4" />
                                    <span>Message</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    <span>View Profile</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="mt-4">
              {loading ? (
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="hidden md:table-cell">Role</TableHead>
                        <TableHead className="hidden md:table-cell">Joined</TableHead>
                        <TableHead className="hidden md:table-cell">Last Active</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers
                        .filter((user) => {
                          const lastActive = new Date(user.lastActive)
                          const sevenDaysAgo = new Date()
                          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                          return lastActive >= sevenDaysAgo
                        })
                        .map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={user.avatar} alt={user.name} />
                                  <AvatarFallback>
                                    {user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell capitalize">{user.role}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex items-center">
                                <span
                                  className={`mr-2 h-2 w-2 rounded-full ${
                                    user.subscribed ? "bg-green-500" : "bg-yellow-500"
                                  }`}
                                ></span>
                                <span>{user.subscribed ? "Subscribed" : "Free"}</span>
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
                                  <DropdownMenuItem>
                                    <Mail className="mr-2 h-4 w-4" />
                                    <span>Message</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    <span>View Profile</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
    </RequireAuth>
  )
}

