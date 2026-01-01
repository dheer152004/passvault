"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

interface PasswordGeneratorProps {
  onUsePassword?: (password: string) => void
}

export function PasswordGenerator({ onUsePassword }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [copied, setCopied] = useState(false)

  const generatePassword = () => {
    let charset = ""
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (includeNumbers) charset += "0123456789"
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

    if (charset === "") {
      alert("Please select at least one character type")
      return
    }

    let password = ""
    const array = new Uint32Array(length)
    crypto.getRandomValues(array)

    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length]
    }

    setGeneratedPassword(password)
    setCopied(false)
  }

  const copyPassword = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleUsePassword = () => {
    if (generatedPassword && onUsePassword) {
      onUsePassword(generatedPassword)
    }
  }

  const getStrength = () => {
    let strength = 0
    if (includeUppercase) strength++
    if (includeLowercase) strength++
    if (includeNumbers) strength++
    if (includeSymbols) strength++

    if (length < 8) return { label: "Weak", color: "bg-red-500", percentage: 25 }
    if (length < 12 || strength < 3) return { label: "Fair", color: "bg-orange-500", percentage: 50 }
    if (length < 16 || strength < 4) return { label: "Good", color: "bg-yellow-500", percentage: 75 }
    return { label: "Strong", color: "bg-green-500", percentage: 100 }
  }

  const strength = getStrength()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password Generator</CardTitle>
        <CardDescription>Create a strong, random password with custom options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generated Password Display */}
        <div className="space-y-2">
          <Label>Generated Password</Label>
          <div className="flex gap-2">
            <Input
              value={generatedPassword}
              readOnly
              placeholder="Click generate to create a password"
              className="font-mono text-base"
            />
            {generatedPassword && (
              <Button variant="outline" onClick={copyPassword}>
                {copied ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Strength Indicator */}
        {generatedPassword && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Password Strength</span>
              <span className="font-medium text-slate-900">{strength.label}</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${strength.color} transition-all duration-300`}
                style={{ width: `${strength.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Length Slider */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Length: {length}</Label>
          </div>
          <Slider value={[length]} onValueChange={(value) => setLength(value[0])} min={8} max={32} step={1} />
        </div>

        {/* Character Options */}
        <div className="space-y-4">
          <Label>Character Types</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase" className="font-normal">
                Uppercase (A-Z)
              </Label>
              <Switch id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="lowercase" className="font-normal">
                Lowercase (a-z)
              </Label>
              <Switch id="lowercase" checked={includeLowercase} onCheckedChange={setIncludeLowercase} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="numbers" className="font-normal">
                Numbers (0-9)
              </Label>
              <Switch id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="symbols" className="font-normal">
                Symbols (!@#$...)
              </Label>
              <Switch id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={generatePassword} className="flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 mr-2"
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Generate
          </Button>
          {onUsePassword && generatedPassword && (
            <Button onClick={handleUsePassword} variant="outline">
              Use Password
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
