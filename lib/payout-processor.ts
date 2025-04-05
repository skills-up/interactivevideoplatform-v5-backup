import type { PayoutTransaction } from "@/types/payout"
import PayoutAccount from "@/models/PayoutAccount"
import Stripe from "stripe"
import axios from "axios"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function verifyPayoutAccount(account: any): Promise<boolean> {
  try {
    switch (account.type) {
      case "stripe":
        return await verifyStripeAccount(account)
      case "paypal":
        return await verifyPayPalAccount(account)
      case "bank_transfer":
        return await verifyBankAccount(account)
      case "crypto":
        return await verifyCryptoWallet(account)
      default:
        throw new Error(`Unsupported account type: ${account.type}`)
    }
  } catch (error) {
    console.error(`Error verifying ${account.type} account:`, error)
    account.status = "rejected"
    await account.save()
    return false
  }
}

async function verifyStripeAccount(account: any): Promise<boolean> {
  if (!account.stripeConnectId) {
    // Create a Stripe Connect account if not provided
    const connectAccount = await stripe.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
    })

    account.stripeConnectId = connectAccount.id
    await account.save()
  }

  // Check if the account is verified with Stripe
  const stripeAccount = await stripe.accounts.retrieve(account.stripeConnectId)

  if (stripeAccount.details_submitted && stripeAccount.payouts_enabled) {
    account.status = "verified"
    await account.save()
    return true
  }

  // Create an account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.stripeConnectId,
    refresh_url: `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/refresh-account-link`,
    return_url: `${process.env.NEXT_PUBLIC_API_URL}/creator/earnings?onboarding=complete`,
    type: "account_onboarding",
  })

  // Store this link for the user to complete onboarding
  console.log("Stripe onboarding link:", accountLink.url)

  return false
}

async function verifyPayPalAccount(account: any): Promise<boolean> {
  if (!account.email) {
    throw new Error("PayPal email is required")
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(account.email)) {
    throw new Error("Invalid email format")
  }

  // Check if the domain exists
  const domain = account.email.split("@")[1]
  try {
    await axios.head(`https://${domain}`)
  } catch (error) {
    // Allow the error to pass - some valid email domains might not have websites
  }

  // In a real implementation, we would verify the PayPal account exists
  // For now, we'll mark it as verified
  account.status = "verified"
  await account.save()
  return true
}

async function verifyBankAccount(account: any): Promise<boolean> {
  if (!account.accountNumber || !account.routingNumber || !account.bankName || !account.accountHolderName) {
    throw new Error("Bank account details are incomplete")
  }

  // Validate routing number format (simplified for US)
  if (!/^\d{9}$/.test(account.routingNumber)) {
    throw new Error("Invalid routing number format")
  }

  // Validate account number format (simplified)
  if (!/^\d{4,17}$/.test(account.accountNumber)) {
    throw new Error("Invalid account number format")
  }

  // In a real implementation, we would verify the routing number against a database
  // of valid routing numbers or use a banking API like Plaid

  // For now, we'll mark it as verified
  account.status = "verified"
  await account.save()
  return true
}

async function verifyCryptoWallet(account: any): Promise<boolean> {
  if (!account.walletAddress || !account.cryptoCurrency || !account.network) {
    throw new Error("Crypto wallet details are incomplete")
  }

  // Basic validation based on cryptocurrency
  let isValid = false

  switch (account.cryptoCurrency.toLowerCase()) {
    case "btc":
      // Bitcoin addresses typically start with 1, 3, or bc1
      isValid = /^(1|3|bc1)[a-zA-Z0-9]{25,42}$/.test(account.walletAddress)
      break
    case "eth":
      // Ethereum addresses are 42 characters long and start with 0x
      isValid = /^0x[a-fA-F0-9]{40}$/.test(account.walletAddress)
      break
    case "usdc":
    case "usdt":
      // These are typically ERC-20 tokens on Ethereum
      isValid = /^0x[a-fA-F0-9]{40}$/.test(account.walletAddress)
      break
    default:
      // For other cryptocurrencies, we'll accept the address if it's at least 26 chars
      isValid = account.walletAddress.length >= 26
  }

  if (!isValid) {
    throw new Error(`Invalid wallet address for ${account.cryptoCurrency}`)
  }

  account.status = "verified"
  await account.save()
  return true
}

export async function processPayoutRequest(payout: PayoutTransaction): Promise<void> {
  // Update status to processing
  payout.status = "processing"
  await payout.save()

  try {
    // Get payout account details
    const account = await PayoutAccount.findById(payout.payoutAccountId)
    if (!account) {
      throw new Error("Payout account not found")
    }

    // Process based on payout method
    switch (account.type) {
      case "stripe":
        await processStripeTransfer(payout, account)
        break
      case "paypal":
        await processPayPalPayout(payout, account)
        break
      case "bank_transfer":
        await processBankTransfer(payout, account)
        break
      case "crypto":
        await processCryptoPayout(payout, account)
        break
      default:
        throw new Error(`Unsupported payout method: ${account.type}`)
    }

    // Update status to completed
    payout.status = "completed"
    payout.processedAt = new Date()
    await payout.save()
  } catch (error) {
    // Update status to failed
    payout.status = "failed"
    payout.failureReason = (error as Error).message
    await payout.save()

    throw error
  }
}

async function processStripeTransfer(payout: PayoutTransaction, account: any): Promise<void> {
  if (!account.stripeConnectId) {
    throw new Error("Stripe Connect ID is required for Stripe payouts")
  }

  // Create a transfer to the connected account
  await stripe.transfers.create({
    amount: Math.round(payout.amount * 100), // Convert to cents
    currency: payout.currency.toLowerCase(),
    destination: account.stripeConnectId,
    transfer_group: payout.reference,
  })
}

async function processPayPalPayout(payout: PayoutTransaction, account: any): Promise<void> {
  if (!account.email) {
    throw new Error("PayPal email is required for PayPal payouts")
  }

  // Get PayPal access token
  const tokenResponse = await axios.post("https://api.paypal.com/v1/oauth2/token", "grant_type=client_credentials", {
    auth: {
      username: process.env.PAYPAL_CLIENT_ID || "",
      password: process.env.PAYPAL_CLIENT_SECRET || "",
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })

  const accessToken = tokenResponse.data.access_token

  // Create PayPal payout
  const payoutResponse = await axios.post(
    "https://api.paypal.com/v1/payments/payouts",
    {
      sender_batch_header: {
        sender_batch_id: payout.reference,
        email_subject: "You have a payout from Interactive Video Platform",
        email_message: payout.description || "Your creator payout has been processed.",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: payout.amount.toFixed(2),
            currency: payout.currency,
          },
          note: payout.description || "Creator payout",
          receiver: account.email,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  )

  if (payoutResponse.status !== 201) {
    throw new Error(`PayPal API error: ${payoutResponse.statusText}`)
  }
}

async function processBankTransfer(payout: PayoutTransaction, account: any): Promise<void> {
  if (!account.accountNumber || !account.routingNumber || !account.bankName || !account.accountHolderName) {
    throw new Error("Bank account details are incomplete")
  }

  // Validate routing number format (simplified for US)
  if (!/^\d{9}$/.test(account.routingNumber)) {
    throw new Error("Invalid routing number format")
  }

  // Validate account number format (simplified)
  if (!/^\d{4,17}$/.test(account.accountNumber)) {
    throw new Error("Invalid account number format")
  }

  // In a real implementation, this would integrate with a banking API or ACH service
  // For example, using Stripe ACH, Plaid, or a direct banking integration

  // For Stripe ACH, you would:
  // 1. Create a bank account token
  const bankAccountToken = await stripe.tokens.create({
    bank_account: {
      country: "US",
      currency: "usd",
      account_holder_name: account.accountHolderName,
      account_holder_type: "individual",
      routing_number: account.routingNumber,
      account_number: account.accountNumber,
    },
  })

  // 2. Create a customer if not exists
  let customer
  try {
    customer = await stripe.customers.retrieve(payout.userId)
  } catch (error) {
    customer = await stripe.customers.create({
      id: payout.userId,
      description: `Creator: ${account.accountHolderName}`,
    })
  }

  // 3. Attach the bank account to the customer
  const bankAccount = await stripe.customers.createSource(customer.id, { source: bankAccountToken.id })

  // 4. Create a payout to the bank account
  await stripe.payouts.create({
    amount: Math.round(payout.amount * 100),
    currency: payout.currency.toLowerCase(),
    method: "standard",
    destination: (bankAccount as any).id,
    statement_descriptor: "CREATOR PAYOUT",
  })
}

async function processCryptoPayout(payout: PayoutTransaction, account: any): Promise<void> {
  if (!account.walletAddress || !account.cryptoCurrency || !account.network) {
    throw new Error("Crypto wallet details are incomplete")
  }

  // In a real implementation, this would integrate with a crypto payment processor
  // For example, using Coinbase Commerce, Circle, or a direct blockchain integration

  // For Coinbase Commerce, you would:
  // 1. Get the current exchange rate for the cryptocurrency
  const exchangeRateResponse = await axios.get(`https://api.coinbase.com/v2/exchange-rates?currency=${payout.currency}`)

  const exchangeRates = exchangeRateResponse.data.data.rates
  const cryptoRate = exchangeRates[account.cryptoCurrency.toUpperCase()]

  if (!cryptoRate) {
    throw new Error(`Exchange rate not available for ${account.cryptoCurrency}`)
  }

  // 2. Calculate the amount in cryptocurrency
  const cryptoAmount = payout.amount / Number.parseFloat(cryptoRate)

  // 3. Create a charge
  const chargeResponse = await axios.post(
    "https://api.commerce.coinbase.com/charges",
    {
      name: "Creator Payout",
      description: payout.description || "Creator payout",
      local_price: {
        amount: payout.amount.toString(),
        currency: payout.currency,
      },
      pricing_type: "fixed_price",
      metadata: {
        payoutId: payout.id,
        userId: payout.userId,
      },
    },
    {
      headers: {
        "X-CC-Api-Key": process.env.COINBASE_COMMERCE_API_KEY || "",
        "X-CC-Version": "2018-03-22",
        "Content-Type": "application/json",
      },
    },
  )

  if (chargeResponse.status !== 201) {
    throw new Error(`Coinbase Commerce API error: ${chargeResponse.statusText}`)
  }

  // 4. Send the cryptocurrency to the wallet
  // In a real implementation, this would be handled by your crypto payment processor
  // or through a direct blockchain transaction

  console.log(
    `Crypto transfer processed: ${cryptoAmount} ${account.cryptoCurrency} to wallet ${account.walletAddress} on network ${account.network}`,
  )
}

