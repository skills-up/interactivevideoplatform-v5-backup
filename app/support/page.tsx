"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, HelpCircle, MessageSquare, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { SupportTicketForm } from "@/components/support/support-ticket-form"

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showTicketSuccess, setShowTicketSuccess] = useState(false)

  const handleTicketSuccess = () => {
    setShowTicketSuccess(true)

    // Reset after 5 seconds
    setTimeout(() => {
      setShowTicketSuccess(false)
    }, 5000)
  }

  const faqCategories = [
    {
      id: "account",
      title: "Account & Profile",
      questions: [
        {
          question: "How do I change my password?",
          answer:
            "To change your password, go to Settings > Security, then click on 'Change Password'. You'll need to enter your current password and then your new password twice to confirm.",
        },
        {
          question: "How do I update my profile information?",
          answer:
            "You can update your profile information by going to Settings > Profile. From there, you can edit your name, bio, profile picture, and other details.",
        },
        {
          question: "Can I delete my account?",
          answer:
            "Yes, you can delete your account by going to Settings > Account > Danger Zone. Please note that this action is permanent and all your data will be deleted.",
        },
      ],
    },
    {
      id: "billing",
      title: "Billing & Subscriptions",
      questions: [
        {
          question: "How do I upgrade to a Creator account?",
          answer:
            "You can upgrade to a Creator account by going to the Upgrade page from your profile menu. Select the Creator plan and follow the payment instructions.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards, PayPal, and in select regions, bank transfers and digital wallets.",
        },
        {
          question: "How do I cancel my subscription?",
          answer:
            "You can cancel your subscription by going to Settings > Subscriptions > Manage. Click on 'Cancel Subscription' and follow the prompts. Your subscription will remain active until the end of the current billing period.",
        },
      ],
    },
    {
      id: "content",
      title: "Content Creation",
      questions: [
        {
          question: "What video formats are supported?",
          answer:
            "We support MP4, MOV, AVI, and WebM video formats. For best results, we recommend using MP4 with H.264 encoding.",
        },
        {
          question: "How do I add interactive elements to my videos?",
          answer:
            "After uploading a video, go to the video editor by clicking 'Edit' on your video. From there, you can add quizzes, decision points, hotspots, and polls at specific timestamps.",
        },
        {
          question: "Is there a limit to how many videos I can upload?",
          answer:
            "Free accounts can upload up to 5 videos per month. Creator accounts can upload unlimited videos, and Professional accounts have additional storage and bandwidth benefits.",
        },
      ],
    },
    {
      id: "technical",
      title: "Technical Issues",
      questions: [
        {
          question: "Why won't my video upload?",
          answer:
            "If you're having trouble uploading videos, check that your file is in a supported format (MP4, MOV, AVI, WebM) and is under the size limit (2GB for free accounts, 10GB for Creator accounts). Also ensure you have a stable internet connection.",
        },
        {
          question: "Why is my video quality low after upload?",
          answer:
            "Videos are transcoded for optimal streaming. For best quality, upload videos with at least 1080p resolution and a high bitrate. Processing may take some time for higher quality videos.",
        },
        {
          question: "The interactive elements aren't appearing in my video",
          answer:
            "Make sure you've published your changes after adding interactive elements. Also check that the viewer has a compatible browser - we recommend using the latest version of Chrome, Firefox, Safari, or Edge.",
        },
      ],
    },
  ]

  // Filter FAQs based on search query
  const filteredFaqs =
    searchQuery.trim() === ""
      ? faqCategories
      : faqCategories
          .map((category) => ({
            ...category,
            questions: category.questions.filter(
              (q) =>
                q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
          }))
          .filter((category) => category.questions.length > 0)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <MainNav />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-6">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">Help & Support</h1>
              <p className="mt-2 text-muted-foreground">Find answers to common questions or contact our support team</p>
            </div>

            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for answers..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="faq">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="faq">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Frequently Asked Questions
                </TabsTrigger>
                <TabsTrigger value="contact">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Support
                </TabsTrigger>
              </TabsList>

              <TabsContent value="faq" className="mt-6">
                {filteredFaqs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
                    <HelpCircle className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No results found</h3>
                    <p className="mt-2 text-center text-muted-foreground">
                      We couldn't find any FAQs matching your search. Try different keywords or contact support.
                    </p>
                    <Button className="mt-4" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredFaqs.map((category) => (
                      <div key={category.id}>
                        <h2 className="mb-4 text-xl font-semibold">{category.title}</h2>
                        <div className="space-y-4">
                          {category.questions.map((faq, index) => (
                            <Card key={index}>
                              <CardHeader>
                                <CardTitle className="text-lg">{faq.question}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p>{faq.answer}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="contact" className="mt-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Contact Options</CardTitle>
                        <CardDescription>Choose the best way to get in touch with us</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-medium">Email Support</h3>
                          <p className="text-sm text-muted-foreground">For general inquiries and non-urgent issues</p>
                          <p className="mt-1 text-sm">support@interactivevid.com</p>
                        </div>
                        <div>
                          <h3 className="font-medium">Live Chat</h3>
                          <p className="text-sm text-muted-foreground">Available Monday-Friday, 9am-5pm PST</p>
                          <Button variant="outline" size="sm" className="mt-1">
                            Start Chat
                          </Button>
                        </div>
                        <div>
                          <h3 className="font-medium">Phone Support</h3>
                          <p className="text-sm text-muted-foreground">For urgent issues (Creator & Pro plans only)</p>
                          <p className="mt-1 text-sm">+1 (555) 123-4567</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Submit a Support Ticket</CardTitle>
                        <CardDescription>
                          Fill out the form below and we'll get back to you as soon as possible
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {showTicketSuccess ? (
                          <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 p-6 text-center">
                            <CheckCircle className="h-12 w-12 text-primary" />
                            <h3 className="mt-4 text-lg font-medium">Ticket Submitted Successfully</h3>
                            <p className="mt-2 text-muted-foreground">
                              Thank you for contacting us. We've received your ticket and will respond shortly. You'll
                              receive a confirmation email with your ticket details.
                            </p>
                            <Button className="mt-4" onClick={() => setShowTicketSuccess(false)}>
                              Submit Another Ticket
                            </Button>
                          </div>
                        ) : (
                          <SupportTicketForm onSuccess={handleTicketSuccess} />
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

