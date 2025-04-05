"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { MessageSquare, MoreHorizontal, Plus, Search, Send, Trash, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string
  timestamp: Date
  isRead: boolean
}

interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    avatar?: string
  }[]
  lastMessage?: {
    content: string
    timestamp: Date
    senderId: string
  }
  unreadCount: number
}

export function MessageCenter() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [newMessageRecipient, setNewMessageRecipient] = useState("")
  const [newMessageContent, setNewMessageContent] = useState("")

  // Fetch conversations
  useEffect(() => {
    if (!isOpen || !session) return

    // In a real app, you would fetch conversations from your API
    // Simulate API call
    const fetchConversations = async () => {
      // Mock data
      const mockConversations: Conversation[] = [
        {
          id: "conv1",
          participants: [
            {
              id: "user1",
              name: "Jane Cooper",
              avatar: "/placeholder.svg?height=40&width=40",
            },
          ],
          lastMessage: {
            content: "Thanks for the feedback on my video!",
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            senderId: "user1",
          },
          unreadCount: 2,
        },
        {
          id: "conv2",
          participants: [
            {
              id: "user2",
              name: "Alex Johnson",
              avatar: "/placeholder.svg?height=40&width=40",
            },
          ],
          lastMessage: {
            content: "When is your next live stream?",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            senderId: "user2",
          },
          unreadCount: 0,
        },
        {
          id: "conv3",
          participants: [
            {
              id: "user3",
              name: "Sarah Williams",
              avatar: "/placeholder.svg?height=40&width=40",
            },
          ],
          lastMessage: {
            content: "I really enjoyed your latest tutorial!",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            senderId: "currentUser",
          },
          unreadCount: 0,
        },
      ]

      setConversations(mockConversations)
    }

    fetchConversations()
  }, [isOpen, session])

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([])
      return
    }

    // In a real app, you would fetch messages from your API
    // Simulate API call
    const fetchMessages = async () => {
      // Find the selected conversation
      const conversation = conversations.find((c) => c.id === selectedConversation)
      if (!conversation) return

      // Mock data
      const mockMessages: Message[] = [
        {
          id: "msg1",
          content: "Hi there! I saw your latest video and had a question about the interactive elements you used.",
          senderId: conversation.participants[0].id,
          senderName: conversation.participants[0].name,
          senderAvatar: conversation.participants[0].avatar,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          isRead: true,
        },
        {
          id: "msg2",
          content: "Hey! Thanks for reaching out. What specific question do you have about the interactive elements?",
          senderId: "currentUser",
          senderName: session?.user?.name || "You",
          senderAvatar: session?.user?.image,
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
          isRead: true,
        },
        {
          id: "msg3",
          content:
            "I was wondering how you created the quiz that appears at the 2:15 mark. Is that a custom implementation or did you use a specific tool?",
          senderId: conversation.participants[0].id,
          senderName: conversation.participants[0].name,
          senderAvatar: conversation.participants[0].avatar,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          isRead: true,
        },
        {
          id: "msg4",
          content:
            "I used the built-in quiz feature in InteractiveVid. It's really easy to set up - just go to the video editor and add a quiz element at the timestamp you want.",
          senderId: "currentUser",
          senderName: session?.user?.name || "You",
          senderAvatar: session?.user?.image,
          timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          isRead: true,
        },
        {
          id: "msg5",
          content: "Thanks for the feedback on my video!",
          senderId: conversation.participants[0].id,
          senderName: conversation.participants[0].name,
          senderAvatar: conversation.participants[0].avatar,
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          isRead: false,
        },
      ]

      setMessages(mockMessages)

      // Mark conversation as read
      setConversations((prev) =>
        prev.map((conv) => (conv.id === selectedConversation ? { ...conv, unreadCount: 0 } : conv)),
      )
    }

    fetchMessages()
  }, [selectedConversation, conversations, session])

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation || !session?.user) return

    // Create new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: messageInput.trim(),
      senderId: "currentUser",
      senderName: session.user.name || "You",
      senderAvatar: session.user.image || undefined,
      timestamp: new Date(),
      isRead: true,
    }

    // Add message to the conversation
    setMessages((prev) => [...prev, newMessage])

    // Update last message in conversation list
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation
          ? {
              ...conv,
              lastMessage: {
                content: messageInput.trim(),
                timestamp: new Date(),
                senderId: "currentUser",
              },
            }
          : conv,
      ),
    )

    // Clear input
    setMessageInput("")

    // In a real app, you would send this message to your API
  }

  const handleCreateNewConversation = () => {
    if (!newMessageRecipient.trim() || !newMessageContent.trim() || !session?.user) {
      toast({
        title: "Error",
        description: "Please enter a recipient and message",
        variant: "destructive",
      })
      return
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: [
        {
          id: `user-${Date.now()}`,
          name: newMessageRecipient.trim(),
          avatar: "/placeholder.svg?height=40&width=40", // Default avatar
        },
      ],
      lastMessage: {
        content: newMessageContent.trim(),
        timestamp: new Date(),
        senderId: "currentUser",
      },
      unreadCount: 0,
    }

    // Add conversation to list
    setConversations((prev) => [newConversation, ...prev])

    // Select the new conversation
    setSelectedConversation(newConversation.id)

    // Create initial message
    const initialMessage: Message = {
      id: `msg-${Date.now()}`,
      content: newMessageContent.trim(),
      senderId: "currentUser",
      senderName: session.user.name || "You",
      senderAvatar: session.user.image || undefined,
      timestamp: new Date(),
      isRead: true,
    }

    // Set messages for the new conversation
    setMessages([initialMessage])

    // Clear form and close dialog
    setNewMessageRecipient("")
    setNewMessageContent("")
    setIsNewConversationOpen(false)

    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully",
    })

    // In a real app, you would create this conversation in your API
  }

  const handleDeleteConversation = (conversationId: string) => {
    // Remove conversation from list
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))

    // If the deleted conversation was selected, clear selection
    if (selectedConversation === conversationId) {
      setSelectedConversation(null)
    }

    toast({
      title: "Conversation Deleted",
      description: "The conversation has been deleted",
    })

    // In a real app, you would delete this conversation in your API
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      // Today, show time
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInDays === 1) {
      // Yesterday
      return "Yesterday"
    } else if (diffInDays < 7) {
      // Within a week, show day name
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      // Older, show date
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) =>
    conv.participants.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex h-[500px] w-[350px] flex-col rounded-lg border bg-background shadow-xl">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="font-semibold">Messages</h3>
        <div className="flex items-center gap-1">
          <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
                <DialogDescription>Send a message to another user on the platform.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="recipient" className="text-sm font-medium">
                    Recipient
                  </label>
                  <Input
                    id="recipient"
                    placeholder="Enter username"
                    value={newMessageRecipient}
                    onChange={(e) => setNewMessageRecipient(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Type your message..."
                    rows={4}
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewConversationOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateNewConversation}>Send Message</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list */}
        <div className={`flex w-full flex-col border-r ${selectedConversation ? "hidden sm:flex sm:w-1/3" : "w-full"}`}>
          <div className="border-b p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {filteredConversations.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4">
                <p className="text-center text-sm text-muted-foreground">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`cursor-pointer p-3 hover:bg-muted ${
                      selectedConversation === conversation.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.participants[0].avatar} />
                        <AvatarFallback>{conversation.participants[0].name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{conversation.participants[0].name}</span>
                          {conversation.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(conversation.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="truncate text-sm text-muted-foreground">
                            {conversation.lastMessage.senderId === "currentUser" ? "You: " : ""}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message view */}
        <div className={`flex w-full flex-col ${selectedConversation ? "w-full sm:w-2/3" : "hidden"}`}>
          {selectedConversation ? (
            <>
              {/* Conversation header */}
              <div className="flex items-center justify-between border-b p-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Button>
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={conversations.find((c) => c.id === selectedConversation)?.participants[0].avatar}
                    />
                    <AvatarFallback>
                      {conversations
                        .find((c) => c.id === selectedConversation)
                        ?.participants[0].name.charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {conversations.find((c) => c.id === selectedConversation)?.participants[0].name}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDeleteConversation(selectedConversation)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === "currentUser" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.senderId === "currentUser" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div
                          className={`mt-1 text-right text-xs ${
                            message.senderId === "currentUser" ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message input */}
              <div className="border-t p-3">
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                >
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <Button type="submit" size="icon" disabled={!messageInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-4">
              <div className="rounded-full bg-muted p-3">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">Your Messages</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Select a conversation or start a new one to begin messaging
              </p>
              <Button className="mt-4" onClick={() => setIsNewConversationOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

