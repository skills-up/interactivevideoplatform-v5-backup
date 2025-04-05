"use client"

import Link from "next/link"

import { useState, useEffect, useRef } from "react"
import { Send, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: Date
}

interface LiveChatProps {
  roomId: string
  isMinimized?: boolean
  onClose?: () => void
  onMinimize?: () => void
}

export function LiveChat({ roomId, isMinimized = false, onClose, onMinimize }: LiveChatProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // In a real app, you would use a WebSocket connection
  useEffect(() => {
    // Simulate connecting to a WebSocket
    const connectTimeout = setTimeout(() => {
      setIsConnected(true)
      setOnlineUsers(Math.floor(Math.random() * 20) + 5) // Random number of users between 5 and 24

      // Add a welcome message
      setMessages([
        {
          id: "system-1",
          userId: "system",
          userName: "System",
          content: "Welcome to the chat! Please be respectful to other users.",
          timestamp: new Date(),
        },
      ])
    }, 1000)

    // Simulate receiving messages periodically
    const messageInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance of receiving a message
        const newMessage: Message = {
          id: `auto-${Date.now()}`,
          userId: `user-${Math.floor(Math.random() * 1000)}`,
          userName: `User${Math.floor(Math.random() * 100)}`,
          content: getRandomMessage(),
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, newMessage])
      }
    }, 5000)

    return () => {
      clearTimeout(connectTimeout)
      clearInterval(messageInterval)
    }
  }, [roomId])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!messageInput.trim() || !session?.user) return

    const newMessage: Message = {
      id: `user-${Date.now()}`,
      userId: session.user.id,
      userName: session.user.name || "Anonymous",
      userAvatar: session.user.image || undefined,
      content: messageInput.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setMessageInput("")

    // In a real app, you would send this message through the WebSocket
  }

  const getRandomMessage = () => {
    const messages = [
      "This is so interesting!",
      "I have a question about this topic.",
      "Thanks for sharing this content.",
      "I'm learning a lot from this.",
      "Has anyone tried implementing this?",
      "Great explanation!",
      "I'm enjoying this stream.",
      "Hello everyone!",
      "This is my first time here.",
      "Looking forward to more content like this.",
    ]

    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-lg">
        <span className="font-medium">Live Chat</span>
        <div className="flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <span className="text-xs">{onlineUsers}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full p-0 text-primary-foreground hover:bg-primary/90"
          onClick={onMinimize}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2 7.5C2 7.22386 2.22386 7 2.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H2.5C2.22386 8 2 7.77614 2 7.5Z"
              fill="currentColor"
            />
          </svg>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[400px] w-[350px] flex-col rounded-lg border bg-background shadow-xl">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Live Chat</h3>
          {isConnected ? (
            <div className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              <span className="text-xs text-muted-foreground">{onlineUsers} online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500"></span>
              </span>
              <span className="text-xs text-muted-foreground">Connecting...</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMinimize}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2 13.5C2 13.7761 2.22386 14 2.5 14H12.5C12.7761 14 13 13.7761 13 13.5C13 13.2239 12.7761 13 12.5 13H2.5C2.22386 13 2 13.2239 2 13.5Z"
                fill="currentColor"
              />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-2">
                {message.userId === "system" ? (
                  <div className="rounded-full bg-primary/10 p-1">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                ) : (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.userAvatar} />
                    <AvatarFallback>{message.userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{message.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t p-2">
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
            disabled={!isConnected || !session}
          />
          <Button type="submit" size="icon" disabled={!messageInput.trim() || !isConnected || !session}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        {!session && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>{" "}
            to join the conversation
          </p>
        )}
      </div>
    </div>
  )
}

