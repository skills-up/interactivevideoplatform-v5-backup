import { cookies } from "next/headers"
import dbConnect from "@/lib/dbConnect"
import AffiliateUser from "@/models/AffiliateUser"
import AffiliateReferral from "@/models/AffiliateReferral"
import AffiliateCommission from "@/models/AffiliateCommission"
import AffiliateProgram from "@/models/AffiliateProgram"
import AffiliatePayoutRequest from "@/models/AffiliatePayoutRequest"

export async function trackReferral(referralCode: string): Promise<boolean> {
  try {
    if (!referralCode) return false

    await dbConnect()

    // Find affiliate user by referral code
    const affiliateUser = await AffiliateUser.findOne({
      referralCode,
      status: "active",
    })

    if (!affiliateUser) return false

    // Store referral code in cookie
    const cookieStore = cookies()

    // Get program for cookie duration
    const program = await AffiliateProgram.findOne({ status: "active" })
    const cookieDuration = program?.cookieDuration || 30 // default 30 days

    // Set cookie with expiration
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + cookieDuration)

    cookieStore.set("affiliate_code", referralCode, {
      expires: expirationDate,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    })

    return true
  } catch (error) {
    console.error("Error tracking referral:", error)
    return false
  }
}

export async function createReferral(userId: string): Promise<boolean> {
  try {
    const cookieStore = cookies()
    const referralCode = cookieStore.get("affiliate_code")?.value

    if (!referralCode) return false

    await dbConnect()

    // Find affiliate user by referral code
    const affiliateUser = await AffiliateUser.findOne({
      referralCode,
      status: "active",
    })

    if (!affiliateUser || affiliateUser.userId === userId) return false

    // Check if user was already referred
    const existingReferral = await AffiliateReferral.findOne({ referredUserId: userId })

    if (existingReferral) return false

    // Create new referral
    const referral = new AffiliateReferral({
      affiliateUserId: affiliateUser.id,
      referredUserId: userId,
      status: "pending",
    })

    await referral.save()

    // Update affiliate user stats
    affiliateUser.totalReferrals += 1
    await affiliateUser.save()

    return true
  } catch (error) {
    console.error("Error creating referral:", error)
    return false
  }
}

export async function confirmReferral(userId: string): Promise<boolean> {
  try {
    await dbConnect()

    // Find pending referral for this user
    const referral = await AffiliateReferral.findOne({
      referredUserId: userId,
      status: "pending",
    })

    if (!referral) return false

    // Update referral status
    referral.status = "confirmed"
    referral.confirmedAt = new Date()
    await referral.save()

    // Get program for commission rate
    const program = await AffiliateProgram.findOne({ status: "active" })
    if (!program) return false

    // Create signup commission
    const signupCommission = new AffiliateCommission({
      affiliateUserId: referral.affiliateUserId,
      referralId: referral.id,
      amount: 1.0, // Fixed $1 for signup
      type: "signup",
      status: "approved",
    })

    await signupCommission.save()

    // Update affiliate user stats
    const affiliateUser = await AffiliateUser.findById(referral.affiliateUserId)
    if (affiliateUser) {
      affiliateUser.totalCommission += signupCommission.amount
      affiliateUser.unpaidCommission += signupCommission.amount
      await affiliateUser.save()
    }

    return true
  } catch (error) {
    console.error("Error confirming referral:", error)
    return false
  }
}

export async function createCommission(
  userId: string,
  amount: number,
  type: "subscription" | "purchase" | "view",
): Promise<boolean> {
  try {
    await dbConnect()

    // Find confirmed referral for this user
    const referral = await AffiliateReferral.findOne({
      referredUserId: userId,
      status: "confirmed",
    })

    if (!referral) return false

    // Get program for commission rate
    const program = await AffiliateProgram.findOne({ status: "active" })
    if (!program) return false

    // Calculate commission amount
    const commissionAmount = amount * program.commissionRate

    // Create commission
    const commission = new AffiliateCommission({
      affiliateUserId: referral.affiliateUserId,
      referralId: referral.id,
      amount: commissionAmount,
      type,
      status: "pending",
    })

    await commission.save()

    return true
  } catch (error) {
    console.error("Error creating commission:", error)
    return false
  }
}

export async function approveCommission(commissionId: string): Promise<boolean> {
  try {
    await dbConnect()

    // Find commission
    const commission = await AffiliateCommission.findById(commissionId)
    if (!commission || commission.status !== "pending") return false

    // Update commission status
    commission.status = "approved"
    await commission.save()

    // Update affiliate user stats
    const affiliateUser = await AffiliateUser.findById(commission.affiliateUserId)
    if (affiliateUser) {
      affiliateUser.totalCommission += commission.amount
      affiliateUser.unpaidCommission += commission.amount
      await affiliateUser.save()
    }

    return true
  } catch (error) {
    console.error("Error approving commission:", error)
    return false
  }
}

export async function processPayoutRequest(payoutRequestId: string): Promise<boolean> {
  try {
    await dbConnect()

    // Find payout request
    const payoutRequest = await AffiliatePayoutRequest.findById(payoutRequestId)
    if (!payoutRequest || payoutRequest.status !== "pending") return false

    // Update payout request status
    payoutRequest.status = "processing"
    await payoutRequest.save()

    // In a real implementation, this would integrate with a payment processor
    // For now, we'll just simulate a successful payout

    // Update payout request status
    payoutRequest.status = "completed"
    payoutRequest.processedAt = new Date()
    await payoutRequest.save()

    // Update affiliate user stats
    const affiliateUser = await AffiliateUser.findById(payoutRequest.affiliateUserId)
    if (affiliateUser) {
      affiliateUser.unpaidCommission -= payoutRequest.amount
      affiliateUser.paidCommission += payoutRequest.amount
      await affiliateUser.save()
    }

    return true
  } catch (error) {
    console.error("Error processing payout request:", error)
    return false
  }
}

