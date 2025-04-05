"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { PayoutAccount } from "@/types/payout"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createPayoutAccount, updatePayoutAccount, deletePayoutAccount } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { BanknoteIcon as Bank, CreditCard, Trash2, Edit, Check, AlertCircle } from "lucide-react"

interface PayoutAccountsProps {
  accounts: PayoutAccount[]
  onAccountsChange: (accounts: PayoutAccount[]) => void
}

export function PayoutAccounts({ accounts, onAccountsChange }: PayoutAccountsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedAccountType, setSelectedAccountType] = useState<string | null>(null)
  const [editingAccount, setEditingAccount] = useState<PayoutAccount | null>(null)

  const handleAddAccount = async (data: any) => {
    try {
      const response = await createPayoutAccount(data)
      onAccountsChange([...accounts, response.account])
      setIsAddDialogOpen(false)
      toast({
        title: "Account added",
        description: "Your payout account has been added successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payout account. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateAccount = async (data: any) => {
    if (!editingAccount) return

    try {
      const response = await updatePayoutAccount(editingAccount.id, data)
      onAccountsChange(accounts.map((account) => (account.id === editingAccount.id ? response.account : account)))
      setEditingAccount(null)
      toast({
        title: "Account updated",
        description: "Your payout account has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payout account. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deletePayoutAccount(accountId)
      onAccountsChange(accounts.filter((account) => account.id !== accountId))
      toast({
        title: "Account deleted",
        description: "Your payout account has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payout account. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payout Accounts</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Account</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Payout Account</DialogTitle>
              <DialogDescription>Add a new account to receive your earnings.</DialogDescription>
            </DialogHeader>

            {!selectedAccountType ? (
              <AccountTypeSelector onSelect={setSelectedAccountType} />
            ) : (
              <AccountForm
                type={selectedAccountType}
                onSubmit={handleAddAccount}
                onCancel={() => setSelectedAccountType(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Payout Accounts</CardTitle>
            <CardDescription>You haven't added any payout accounts yet.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setIsAddDialogOpen(true)}>Add Your First Account</Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={() => setEditingAccount(account)}
              onDelete={() => handleDeleteAccount(account.id)}
            />
          ))}
        </div>
      )}

      {editingAccount && (
        <Dialog open={!!editingAccount} onOpenChange={(open) => !open && setEditingAccount(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Payout Account</DialogTitle>
              <DialogDescription>Update your payout account details.</DialogDescription>
            </DialogHeader>

            <AccountForm
              type={editingAccount.type}
              account={editingAccount}
              onSubmit={handleUpdateAccount}
              onCancel={() => setEditingAccount(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function AccountTypeSelector({ onSelect }: { onSelect: (type: string) => void }) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-accent" onClick={() => onSelect("bank_transfer")}>
          <CardHeader className="pb-2">
            <Bank className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">Bank Transfer</CardTitle>
            <CardDescription>Receive payouts directly to your bank account</CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent" onClick={() => onSelect("paypal")}>
          <CardHeader className="pb-2">
            <CreditCard className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">PayPal</CardTitle>
            <CardDescription>Receive payouts to your PayPal account</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-accent" onClick={() => onSelect("stripe")}>
          <CardHeader className="pb-2">
            <CreditCard className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">Stripe</CardTitle>
            <CardDescription>Connect with Stripe for payouts</CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent" onClick={() => onSelect("crypto")}>
          <CardHeader className="pb-2">
            <CreditCard className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">Cryptocurrency</CardTitle>
            <CardDescription>Receive payouts in cryptocurrency</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AccountCard({
  account,
  onEdit,
  onDelete,
}: {
  account: PayoutAccount
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{getAccountTypeLabel(account.type)}</CardTitle>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete this payout account.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <CardDescription>
          {account.isDefault && (
            <span className="flex items-center text-primary">
              <Check className="h-3 w-3 mr-1" /> Default account
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {account.status !== "verified" && (
            <div className="flex items-center text-amber-500 mb-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">
                {account.status === "pending" ? "Verification pending" : "Verification failed"}
              </span>
            </div>
          )}

          {account.type === "bank_transfer" && (
            <>
              <p className="text-sm font-medium">{account.bankName}</p>
              <p className="text-sm text-muted-foreground">{account.accountHolderName}</p>
              <p className="text-sm text-muted-foreground">
                {account.accountType} •••• {account.accountNumber?.slice(-4)}
              </p>
            </>
          )}

          {account.type === "paypal" && <p className="text-sm text-muted-foreground">{account.email}</p>}

          {account.type === "stripe" && <p className="text-sm text-muted-foreground">Stripe Connect Account</p>}

          {account.type === "crypto" && (
            <>
              <p className="text-sm font-medium">{account.cryptoCurrency}</p>
              <p className="text-sm text-muted-foreground">
                {account.walletAddress?.slice(0, 6)}...{account.walletAddress?.slice(-4)}
              </p>
              <p className="text-sm text-muted-foreground">Network: {account.network}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Form schemas
const bankAccountSchema = z.object({
  type: z.literal("bank_transfer"),
  accountNumber: z.string().min(1, "Account number is required"),
  routingNumber: z.string().min(1, "Routing number is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountHolderName: z.string().min(1, "Account holder name is required"),
  accountType: z.enum(["checking", "savings"]),
  isDefault: z.boolean().default(false),
})

const paypalAccountSchema = z.object({
  type: z.literal("paypal"),
  email: z.string().email("Invalid email address"),
  isDefault: z.boolean().default(false),
})

const stripeAccountSchema = z.object({
  type: z.literal("stripe"),
  isDefault: z.boolean().default(false),
})

const cryptoAccountSchema = z.object({
  type: z.literal("crypto"),
  walletAddress: z.string().min(1, "Wallet address is required"),
  cryptoCurrency: z.string().min(1, "Cryptocurrency is required"),
  network: z.string().min(1, "Network is required"),
  isDefault: z.boolean().default(false),
})

function AccountForm({
  type,
  account,
  onSubmit,
  onCancel,
}: {
  type: string
  account?: PayoutAccount
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  let schema
  switch (type) {
    case "bank_transfer":
      schema = bankAccountSchema
      break
    case "paypal":
      schema = paypalAccountSchema
      break
    case "stripe":
      schema = stripeAccountSchema
      break
    case "crypto":
      schema = cryptoAccountSchema
      break
    default:
      schema = z.object({})
  }

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type,
      isDefault: account?.isDefault || false,
      ...account,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        {type === "bank_transfer" && (
          <>
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountHolderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="routingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Routing Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {type === "paypal" && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PayPal Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {type === "stripe" && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              You'll be redirected to Stripe to complete the setup process after saving.
            </p>
          </div>
        )}

        {type === "crypto" && (
          <>
            <FormField
              control={form.control}
              name="cryptoCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cryptocurrency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                      <SelectItem value="USDT">Tether (USDT)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="network"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Network</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Bitcoin">Bitcoin</SelectItem>
                      <SelectItem value="Ethereum">Ethereum</SelectItem>
                      <SelectItem value="Polygon">Polygon</SelectItem>
                      <SelectItem value="Solana">Solana</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="isDefault"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Default Account</FormLabel>
                <FormDescription>Make this your default payout account</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

// Helper functions
function getAccountTypeLabel(type: string): string {
  switch (type) {
    case "bank_transfer":
      return "Bank Transfer"
    case "paypal":
      return "PayPal"
    case "stripe":
      return "Stripe"
    case "crypto":
      return "Cryptocurrency"
    default:
      return "Unknown"
  }
}

