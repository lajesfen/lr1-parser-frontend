"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface GrammarInputProps {
  grammar: string
  input: string
  onGrammarChange: (value: string) => void
  onInputChange: (value: string) => void
}

export default function GrammarInput({ grammar, input, onGrammarChange, onInputChange }: GrammarInputProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Grammar Input */}
      <div className="space-y-2">
        <Label htmlFor="grammar" className="text-muted-foreground">
          Grammar Rules
        </Label>
        <Textarea
          id="grammar"
          placeholder="E -> E + T | T&#10;T -> T * F | F&#10;F -> ( E ) | id"
          value={grammar}
          onChange={(e) => onGrammarChange(e.target.value)}
          className="h-40 bg-background border-border text-foreground placeholder-muted-foreground font-mono text-sm resize-none"
        />
        <p className="text-xs text-muted-foreground">Format: A -&gt; α | β (one production per line)</p>
      </div>

      {/* Input String */}
      <div className="space-y-2">
        <Label htmlFor="input" className="text-muted-foreground">
          Input String
        </Label>
        <Textarea
          id="input"
          placeholder="id + id * id"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          className="h-40 bg-background border-border text-foreground placeholder-muted-foreground font-mono text-sm resize-none"
        />
        <p className="text-xs text-muted-foreground">Enter the string to parse (space-separated tokens)</p>
      </div>
    </div>
  )
}
