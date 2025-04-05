"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface PollInteractionProps {
  interaction: {
    id: string
    title?: string
    question: string
    options: {
      id: string
      text: string
    }[]
    style?: any
  }
  onComplete: (result: any) => void
  onSkip: () => void
  allowSkipping?: boolean
  skipAfterSeconds?: number
  allowSubmissions?: boolean
}

export function PollInteraction({
  interaction,
  onComplete,
  onSkip,
  allowSkipping = true,
  skipAfterSeconds = 5,
  allowSubmissions = true,
}: PollInteractionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [results, setResults] = useState<{ [key: string]: number }>({})
  const [totalVotes, setTotalVotes] = useState(0)
  const [timeLeft, setTimeLeft] = useState(skipAfterSeconds)
  const [showSkipTimer, setShowSkipTimer] = useState(allowSkipping)

  // Apply custom styles if provided
  const cardStyle = {
    backgroundColor: interaction.style?.backgroundColor || "white",
    color: interaction.style?.textColor || "inherit",
    borderColor: interaction.style?.borderColor,
    borderWidth: interaction.style?.borderWidth,
    borderStyle: interaction.style?.borderStyle,
    borderRadius: interaction.style?.borderRadius,
    padding: interaction.style?.padding,
    boxShadow: interaction.style?.boxShadow,
    fontFamily: interaction.style?.fontFamily,
    fontSize: interaction.style?.fontSize,
    width: interaction.style?.width || "100%",
    maxWidth: interaction.style?.maxWidth || "500px",
    opacity: interaction.style?.opacity !== undefined ? interaction.style.opacity : 1,
  }

  const optionStyle = {
    backgroundColor: interaction.style?.optionStyle?.backgroundColor || "white",
    color: interaction.style?.optionStyle?.textColor || "inherit",
    borderColor: interaction.style?.optionStyle?.borderColor || "inherit",
    borderRadius: interaction.style?.optionStyle?.borderRadius || "0.375rem",
    padding: "0.75rem",
    marginBottom: "0.5rem",
  }

  const barColor = interaction.style?.poll?.barColor || "hsl(var(--primary))"

  // Skip timer
  useEffect(() => {
    if (!allowSkipping || isSubmitted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowSkipTimer(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [allowSkipping, isSubmitted])

  // Simulate fetching poll results
  useEffect(() => {
    if (!isSubmitted) return

    // In a real app, you would fetch real results from an API
    // This is just a simulation
    const simulatedResults: { [key: string]: number } = {}
    let total = 0

    interaction.options.forEach((option) => {
      // Generate random vote count between 5 and 50
      const votes = Math.floor(Math.random() * 46) + 5
      simulatedResults[option.id] = votes
      total += votes
    })

    // Add the user's vote
    if (selectedOption) {
      simulatedResults[selectedOption] += 1
      total += 1
    }

    setResults(simulatedResults)
    setTotalVotes(total)
  }, [isSubmitted, interaction.options, selectedOption])

  const handleSubmit = () => {
    if (!selectedOption || !allowSubmissions) return

    setIsSubmitted(true)
    setShowSkipTimer(false)

    // Prepare result data
    const result = {
      interactionId: interaction.id,
      selectedOptionId: selectedOption,
      timestamp: new Date().toISOString(),
    }

    // Delay completion to allow user to see the results
    setTimeout(() => {
      onComplete(result)
    }, 3000)
  }

  const getPercentage = (optionId: string) => {
    if (totalVotes === 0) return 0
    return Math.round((results[optionId] / totalVotes) * 100)
  }

  return (
    <Card className="w-full" style={cardStyle}>
      <CardHeader>
        <CardTitle className="text-xl">{interaction.title || "Poll Question"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-lg">{interaction.question}</div>

        {!isSubmitted ? (
          <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption} className="space-y-2">
            {interaction.options.map((option) => (
              <div
                key={option.id}
                style={optionStyle}
                className="flex items-center rounded-md border transition-colors"
              >
                <RadioGroupItem value={option.id} id={option.id} className="ml-2" />
                <Label htmlFor={option.id} className="flex-grow p-2 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-4">
            {interaction.options.map((option) => (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{option.text}</span>
                  <span>{getPercentage(option.id)}%</span>
                </div>
                <Progress
                  value={getPercentage(option.id)}
                  className="h-2"
                  style={
                    {
                      "--progress-background": barColor,
                    } as React.CSSProperties
                  }
                />
                <p className="text-xs text-muted-foreground">{results[option.id] || 0} votes</p>
              </div>
            ))}
            <p className="text-sm text-center mt-4">Total votes: {totalVotes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {showSkipTimer && allowSkipping && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            Skip in {timeLeft}s
          </div>
        )}
        {!showSkipTimer && allowSkipping && !isSubmitted && (
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
        )}
        {!isSubmitted ? (
          <Button onClick={handleSubmit} disabled={!selectedOption || !allowSubmissions}>
            Submit Vote
          </Button>
        ) : (
          <div />
        )}
      </CardFooter>
    </Card>
  )
}

