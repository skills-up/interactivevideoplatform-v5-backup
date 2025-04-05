"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { Send, Search, MessageSquare, Flag, CheckCheck, User, Users } from "lucide-react"

interface MessagingProps {
  userId: string
}

export function Messaging({ userId }: MessagingProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const fetchConversations = async () => {
      if (!session?.user) return

      try {
        setIsLoading(true)

        const response = await fetch(`/api/users/${userId}/conversations`)
        if (!response.ok) throw new Error("Failed to fetch conversations")

        const data = await response.json()
        setConversations(data.conversations)

        // Select the first conversation by default
        if (data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.conversations[0])
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [userId, session, selectedConversation])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !session?.user) return

      try {
        const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`)
        if (!response.ok) throw new Error("Failed to fetch messages")

        const data = await response.json()
        setMessages(data.messages)

        // Mark conversation as read
        if (selectedConversation.unreadCount > 0) {
          await fetch(`/api/conversations/${selectedConversation.id}/read`, {
            method: "POST",
          })

          // Update the unread count in the conversations list
          setConversations(
            conversations.map((conv) => (conv.id === selectedConversation.id ? { ...conv, unreadCount: 0 } : conv)),
          )
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      }
    }

    fetchMessages()
  }, [selectedConversation, session, conversations])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !session?.user) return

    try {
      setIsSending(true)

      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          senderId: session.user.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()

      // Add the new message to the messages list
      setMessages([...messages, data.message])

      // Clear the input
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleCreateTicket = async () => {
    if (!session?.user) return

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          subject: "Support Request",
          message: "I need help with...",
        }),
      })

      if (!response.ok) throw new Error("Failed to create ticket")

      const data = await response.json()

      // Add the new conversation to the list
      setConversations([data.conversation, ...conversations])

      // Select the new conversation
      setSelectedConversation(data.conversation)

      toast({
        title: "Support Ticket Created",
        description: "Your support ticket has been created",
      })
    } catch (error) {
      console.error("Error creating ticket:", error)
      toast({
        title: "Error",
        description: "Failed to create support ticket",
        variant: "destructive",
      })
    }
  }

  const handleReportContent = async () => {
    if (!session?.user) return

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          type: "content",
          reason: "inappropriate",
          details: "I want to report content that...",
        }),
      })

      if (!response.ok) throw new Error("Failed to submit report")

      toast({
        title: "Report Submitted",
        description: "Your report has been submitted for review",
      })
    } catch (error) {
      console.error("Error submitting report:", error)
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      })
    }
  }

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r bg-muted/20">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="p-2">
          <Button variant="outline" className="w-full mb-2" onClick={handleCreateTicket}>
            <MessageSquare className="h-4 w-4 mr-2" />
            New Support Ticket
          </Button>

          <Button variant="outline" className="w-full" onClick={handleReportContent}>
            <Flag className="h-4 w-4 mr-2" />
            Report Content
          </Button>
        </div>

        <div className="overflow-y-auto h-[calc(600px-130px)]">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 border-b flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No conversations found</div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 border-b flex items-start space-x-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversation?.id === conv.id ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedConversation(conv)}
              >
                <Avatar>
                  <AvatarImage src={conv.isGroup ? undefined : conv.participants[0]?.avatar} />
                  <AvatarFallback>
                    {conv.isGroup ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm truncate">{conv.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessage?.content || "No messages yet"}
                  </p>

                  <div className="flex items-center mt-1">
                    {conv.type === "support" && (
                      <Badge variant="outline" className="text-xs mr-2">
                        Support
                      </Badge>
                    )}
                    {conv.type === "report" && (
                      <Badge variant="outline" className="text-xs mr-2">
                        Report
                      </Badge>
                    )}
                    {conv.status === "open" && (
                      <Badge variant="secondary" className="text-xs mr-2">
                        Open
                      </Badge>
                    )}
                    {conv.status === "closed" && (
                      <Badge variant="outline" className="text-xs mr-2">
                        Closed
                      </Badge>
                    )}
                    {conv.unreadCount > 0 && <Badge className="ml-auto">{conv.unreadCount}</Badge>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-medium">{selectedConversation.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.isGroup
                    ? `${selectedConversation.participants.length} participants`
                    : `Last active: ${new Date(selectedConversation.updatedAt).toLocaleString()}`}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {selectedConversation.status === "open" ? (
                  <Badge variant="secondary">Open</Badge>
                ) : (
                  <Badge variant="outline">Closed</Badge>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => {
                  const isCurrentUser = message.senderId === session?.user?.id

                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {!isCurrentUser && <div className="font-medium text-xs mb-1">{message.sender.name}</div>}

                        <p className="text-sm">{message.content}</p>

                        <div className="flex justify-end items-center mt-1 text-xs opacity-70">
                          <span>
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {isCurrentUser && message.read && <CheckCheck className="h-3 w-3 ml-1" />}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {selectedConversation.status === "open" && (
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={isSending}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

