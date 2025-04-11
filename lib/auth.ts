import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "viewer", // Default role for new users
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        await dbConnect()

        const user = await User.findOne({ email: credentials.email })
        if (!user) {
          throw new Error("User not found")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        await dbConnect()

        const email = user.email
        if (!email) {
          return false
        }

        // Check if user exists
        let dbUser = await User.findOne({ email })

        if (!dbUser) {
          // Create new user
          dbUser = await User.create({
            name: user.name,
            email,
            image: user.image,
            emailVerified: new Date(),
            role: "user",
            accounts: [
              {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                expiresAt: account.expires_at,
              },
            ],
          })
        } else {
          // Update existing user's OAuth account
          const existingAccount = dbUser.accounts?.find(
            (acc) => acc.provider === account.provider && acc.providerAccountId === account.providerAccountId,
          )

          if (!existingAccount) {
            // Add new account to user
            dbUser.accounts = [
              ...(dbUser.accounts || []),
              {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                expiresAt: account.expires_at,
              },
            ]
          } else {
            // Update existing account
            dbUser.accounts = dbUser.accounts?.map((acc) => {
              if (acc.provider === account.provider && acc.providerAccountId === account.providerAccountId) {
                return {
                  ...acc,
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token,
                  expiresAt: account.expires_at,
                }
              }
              return acc
            })
          }

          // Update user profile
          dbUser.name = user.name || dbUser.name
          dbUser.image = user.image || dbUser.image
          dbUser.emailVerified = new Date()

          await dbUser.save()
        }

        // Set user ID to the database user ID
        user.id = dbUser._id.toString()
        user.role = dbUser.role
      }

      return true
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

