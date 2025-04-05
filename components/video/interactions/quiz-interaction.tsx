"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface QuizInteractionProps {
  interaction: {
    id: string
    title?: string
    question: string
    options: {
      id: string
      text: string
      isCorrect?: boolean
    }[]
    correctFeedback?: string
    incorrectFeedback?: string
    style?: any
  }
  onComplete: (result: any) => void
  onSkip: () => void
  allowSkipping?: boolean
  skipAfterSeconds?: number
  allowSubmissions?: boolean
}

export function QuizInteraction({
  interaction,
  onComplete,
  onSkip,
  allowSkipping = true,
  skipAfterSeconds = 5,
  allowSubmissions = true,
}: QuizInteractionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
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

  const optionStyle = (option: any) => ({
    backgroundColor:
      isSubmitted && option.isCorrect
        ? interaction.style?.optionStyle?.correctBackgroundColor || "#d1fae5"
        : isSubmitted && selectedOption === option.id && !option.isCorrect
          ? interaction.style?.optionStyle?.incorrectBackgroundColor || "#fee2e2"
          : interaction.style?.optionStyle?.backgroundColor || "white",
    color: interaction.style?.optionStyle?.textColor || "inherit",
    borderColor: interaction.style?.optionStyle?.borderColor || "inherit",
    borderRadius: interaction.style?.optionStyle?.borderRadius || "0.375rem",
    padding: "0.75rem",
    marginBottom: "0.5rem",
  })

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

  const handleSubmit = () => {
    if (!selectedOption || !allowSubmissions) return

    const selectedOptionData = interaction.options.find((option) => option.id === selectedOption)

    const isAnswerCorrect = selectedOptionData?.isCorrect || false
    setIsCorrect(isAnswerCorrect)
    setIsSubmitted(true)
    setShowSkipTimer(false)

    // Prepare result data
    const result = {
      interactionId: interaction.id,
      selectedOptionId: selectedOption,
      isCorrect: isAnswerCorrect,
      timestamp: new Date().toISOString(),
    }

    // Delay completion to allow user to see the result
    setTimeout(() => {
      onComplete(result)
    }, 2000)
  }

  return (
    <Card className="w-full" style={cardStyle}>
      <CardHeader>
        <CardTitle className="text-xl">{interaction.title || "Quiz Question"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-lg">{interaction.question}</div>

        <RadioGroup
          value={selectedOption || ""}
          onValueChange={setSelectedOption}
          className="space-y-2"
          disabled={isSubmitted}
        >
          {interaction.options.map((option) => (
            <div key={option.id} style={optionStyle} className="flex items-center rounded-md border transition-colors">
              <RadioGroupItem value={option.id} id={option.id} className="ml-2" disabled={isSubmitted} />
              <Label htmlFor={option.id} className="flex-grow p-2 cursor-pointer">
                {option.text}
              </Label>
              {isSubmitted && option.isCorrect && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
              {isSubmitted && selectedOption === option.id && !option.isCorrect && (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
            </div>
          ))}
        </RadioGroup>

        {isSubmitted && (
          <Alert
            variant={isCorrect ? "default" : "destructive"}
            className={`mt-4 ${
              isCorrect ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {isCorrect ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription>
              {isCorrect
                ? interaction.correctFeedback || "Correct answer!"
                : interaction.incorrectFeedback || "Incorrect answer. Try again!"}
            </AlertDescription>
          </Alert>
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
            Submit Answer
          </Button>
        ) : (
          <div />
        )}
      </CardFooter>
    </Card>
  )
}

