"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

interface Referral {
  id: string
  referredUserId: string
  createdAt: string
  status: string
}

export function AffiliateReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const { data: session } = useSession()

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!session?.user) return

      setIsLoading(true)
      try {
        // Simulate API call
        setTimeout(() => {
          const mockReferrals = [
            {
              id: "ref1",
              referredUserId: "user123",
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              status: "confirmed",
            },
            {
              id: "ref2",
              referredUserId: "user456",
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              status: "pending",
            },
            {
              id: "ref3",
              referredUserId: "user789",
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              status: "confirmed",
            },
          ]
          setReferrals(mockReferrals)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching referrals:", error)
        toast({
          title: "Error",
          description: "Failed to load referrals",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReferrals()
  }, [session, toast])

  const filteredReferrals = referrals.filter((referral) =>
    referral.referredUserId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referrals</CardTitle>
        <CardDescription>List of users you have referred</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            type="search"
            placeholder="Search by user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredReferrals.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>{referral.referredUserId}</TableCell>
                    <TableCell>{new Date(referral.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{referral.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">No referrals found</div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline">View All Referrals</Button>
      </CardFooter>
    </Card>
  )
}

