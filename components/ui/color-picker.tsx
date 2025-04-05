"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(color)
  const [isOpen, setIsOpen] = useState(false)
  const colorInputRef = useRef<HTMLInputElement>(null)

  // Update input value when color prop changes
  useEffect(() => {
    setInputValue(color)
  }, [color])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Validate hex color
    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      onChange(value)
    }
  }

  // Handle color input change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    onChange(value)
  }

  // Handle blur event
  const handleBlur = () => {
    // Reset to valid color if input is invalid
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(inputValue)) {
      setInputValue(color)
    }
  }

  // Predefined colors
  const predefinedColors = [
    "#000000",
    "#ffffff",
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
    "#795548",
    "#607d8b",
  ]

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-2"
            style={{ backgroundColor: color }}
            aria-label="Pick a color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="color-input" className="text-sm font-medium">
                  Color
                </label>
                <span className="text-xs text-muted-foreground">{inputValue}</span>
              </div>
              <input
                ref={colorInputRef}
                type="color"
                id="color-input"
                value={inputValue}
                onChange={handleColorChange}
                className="w-full h-8 cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor="hex-input" className="text-sm font-medium">
                Hex Value
              </label>
              <Input
                id="hex-input"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="font-mono"
                maxLength={7}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Presets</label>
              <div className="grid grid-cols-5 gap-2">
                {predefinedColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    className={cn(
                      "w-8 h-8 rounded-md border border-gray-200",
                      presetColor === color && "ring-2 ring-primary ring-offset-2",
                    )}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => {
                      setInputValue(presetColor)
                      onChange(presetColor)
                    }}
                    aria-label={`Select color ${presetColor}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Input value={inputValue} onChange={handleInputChange} onBlur={handleBlur} className="font-mono" maxLength={7} />
    </div>
  )
}

