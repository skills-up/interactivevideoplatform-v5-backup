"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { PayoutTransaction, PayoutAccount } from "@/types/payout"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createPayoutRequest } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

interface PayoutHistoryProps {
  transactions: PayoutTransaction[]
  accounts: PayoutAccount[]
  availableBalance: number
  onTransactionsChange: (transactions: PayoutTransaction[]) => void
}

export function PayoutHistory({ transactions, accounts, availableBalance, onTransactionsChange }: PayoutHistoryProps) {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)

  const handleRequestPayout = async (data: z.infer<typeof payoutRequestSchema>) => {
    try {
      const response = await createPayoutRequest(data)
      onTransactionsChange([response.payout, ...transactions])
      setIsRequestDialogOpen(false)
      toast({
        title: "Payout requested",
        description: "Your payout request has been submitted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request payout. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payout History</h2>
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={availableBalance <= 0 || accounts.length === 0}>Request Payout</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
              <DialogDescription>Request a payout to your preferred account.</DialogDescription>
            </DialogHeader>

            <PayoutRequestForm onSubmit={handleRequestPayout} accounts={accounts} availableBalance={availableBalance} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => {
              const account = accounts.find((a) => a.id === transaction.payoutAccountId)

              return (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                  <TableCell>{transaction.reference}</TableCell>
                  <TableCell className="font-medium">
                    ${transaction.amount.toFixed(2)} {transaction.currency}
                  </TableCell>
                  <TableCell>{getAccountLabel(account)}</TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                </TableRow>
              )
            })}

            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No payout transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Helper functions
function getAccountLabel(account?: PayoutAccount): string {
  if (!account) return "Unknown account"

  switch (account.type) {
    case "bank_transfer":
      return `Bank: ${account.bankName} (${maskAccountNumber(account.accountNumber)})`
    case "paypal":
      return `PayPal: ${account.email}`
    case "stripe":
      return "Stripe Connect"
    case "crypto":
      return `${account.cryptoCurrency}: ${maskWalletAddress(account.walletAddress)}`
    default:
      return "Unknown account type"
  }
}

function maskAccountNumber(accountNumber?: string): string {
  if (!accountNumber) return ""
  return `****${accountNumber.slice(-4)}`
}

function maskWalletAddress(address?: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default"

  switch (status) {
    case "pending":
      variant = "secondary"
      break
    case "processing":
      variant = "outline"
      break
    case "completed":
      variant = "default"
      break
    case "failed":
      variant = "destructive"
      break
  }

  return <Badge variant={variant}>{status}</Badge>
}

// Form components
const payoutRequestSchema = z.object({
  payoutAccountId: z.string().min(1, "Payout account is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  description: z.string().optional(),
})

function PayoutRequestForm({
  onSubmit,
  accounts,
  availableBalance,
}: {
  onSubmit: (data: z.infer<typeof payoutRequestSchema>) => void
  accounts: PayoutAccount[]
  availableBalance: number
}) {
  const defaultAccount = accounts.find((a) => a.isDefault) || accounts[0]

  const form = useForm<z.infer<typeof payoutRequestSchema>>({
    resolver: zodResolver(payoutRequestSchema),
    defaultValues: {
      payoutAccountId: defaultAccount?.id || "",
      amount: Math.min(availableBalance, 100),
      currency: "USD",
      description: "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="payoutAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payout Account</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountLabel(account)}
                      {account.isDefault && " (Default)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (USD)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0.01}
                  max={availableBalance}
                  step={0.01}
                  {...field}
                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit">Request Payout</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

