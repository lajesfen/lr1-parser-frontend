"use client"

import GrammarInput from "@/components/grammar-input"
import ResultsDisplay from "@/components/results-display"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useState } from "react"

interface ParseResponse {
  grammar: {
    start_symbol: string
    non_terminals: string[]
    terminals: string[]
    productions: Record<string, string[]>
    first: Record<string, string[]>
  }
  dfa: unknown[]
  parsing_table: Record<string, unknown>
  parse_result: {
    accepted: boolean
    trace?: string[]
  }
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5002"

if (typeof window !== "undefined") {
  console.log("[v0] BACKEND_URL:", BACKEND_URL)
  console.log("[v0] NEXT_PUBLIC_BACKEND_URL env:", process.env.NEXT_PUBLIC_BACKEND_URL)
}

export default function Home() {
  const [grammar, setGrammar] = useState("")
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<ParseResponse | null>(null)
  const [activeTab, setActiveTab] = useState("grammar")

  const handleAnalyze = async () => {
    if (!grammar.trim() || !input.trim()) {
      setError("Please enter both grammar and input string")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    console.log("[v0] Making API call to:", `${BACKEND_URL}/analyze`)

    try {
      const response = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grammar: grammar.trim(),
          input: input.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.statusText}`
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setResult(data)
      setActiveTab("grammar")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to analyze grammar"
      console.log("[v0] Error caught:", message)
      if (message.includes("Failed to fetch") || message.includes("CORS")) {
        setError(`Connection error: Make sure the backend is running at ${BACKEND_URL}`)
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setGrammar("")
    setInput("")
    setError("")
    setResult(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">LR(1) Parser</h1>
          <p className="text-muted-foreground">Analyze grammars and parse input strings with LR(1) parsing</p>
          <p className="text-xs text-muted-foreground mt-2">Backend: {BACKEND_URL}</p>
        </div>

        {/* Input Section */}
        <Card className="mb-6 border-border bg-card/50 backdrop-blur">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Input</h2>
            <GrammarInput grammar={grammar} input={input} onGrammarChange={setGrammar} onInputChange={setInput} />

            {/* Error Message */}
            {error && (
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/30 p-4">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive-foreground">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-border text-muted-foreground hover:bg-secondary bg-transparent"
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Section */}
        {result && (
          <Card className="border-border bg-card/50 backdrop-blur">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                {result.parse_result.accepted ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-accent" />
                    <h2 className="text-xl font-semibold text-accent-foreground">Accepted</h2>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-destructive" />
                    <h2 className="text-xl font-semibold text-destructive-foreground">Rejected</h2>
                  </>
                )}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 bg-secondary border-border">
                  <TabsTrigger value="grammar">
                    Grammar
                  </TabsTrigger>
                  <TabsTrigger value="dfa">
                    DFA
                  </TabsTrigger>
                  <TabsTrigger value="table">
                    Parse Table
                  </TabsTrigger>
                  <TabsTrigger value="trace">
                    Trace
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="grammar" className="mt-4">
                  <ResultsDisplay title="Grammar Analysis" data={result.grammar} />
                </TabsContent>

                <TabsContent value="dfa" className="mt-4">
                  <ResultsDisplay title="DFA States" data={result.dfa} />
                </TabsContent>

                <TabsContent value="table" className="mt-4">
                  <ResultsDisplay title="Parsing Table" data={result.parsing_table} />
                </TabsContent>

                <TabsContent value="trace" className="mt-4">
                  <ResultsDisplay title="Parse Trace" data={result.parse_result} />
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}
