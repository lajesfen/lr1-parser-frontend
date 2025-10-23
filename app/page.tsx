
"use client"

import GrammarInput from "@/components/grammar-input"
import ResultsDisplay from "@/components/results-display"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, GitBranch, Loader2, Network } from "lucide-react"
import { useState } from "react"

interface ParseResponse {
  grammar: {
    start_symbol: string
    non_terminals: string[]
    terminals: string[]
    productions: Record<string, string[]>
    first: Record<string, string[]>
  }
  nfa_states_count: number
  dfa_states_count: number
  dfa: Array<{
    id: number
    items: Array<{
      head: string
      body: string[]
      dot_position: number
      lookahead: string
    }>
    transitions: Record<string, number>
    reductions: Record<string, { head: string; body: string[] }>
  }>
  parsing_table: {
    action: Record<string, Record<string, string>>
    goto: Record<string, Record<string, string>>
    rules: Array<{ num: number; head: string; body: string[] }>
  }
  parse_result: {
    accepted: boolean
    steps: Array<{
      step: number
      stack: (string | number)[]
      input: string[]
      action: string
    }>
    error?: string
  } | null
  visualizations?: {
    nfa: string | null
    dfa: string | null
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
      console.log("[v0] Response data:", data)
      console.log("[v0] Visualizations:", data.visualizations)
      console.log("[v0] Parse result:", data.parse_result)
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
      <div className="mx-auto max-w-7xl">
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
        {result && result.parse_result && (
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
                <div className="overflow-x-auto -mx-6 px-6 pb-2">
                  <TabsList className="inline-flex min-w-full lg:grid lg:grid-cols-6 bg-secondary border-border">
                    <TabsTrigger value="grammar" className="whitespace-nowrap">
                      Grammar
                    </TabsTrigger>
                    <TabsTrigger value="nfa" className="whitespace-nowrap">
                      <GitBranch className="w-4 h-4 mr-1" />
                      NFA Graph
                    </TabsTrigger>
                    <TabsTrigger value="dfa-graph" className="whitespace-nowrap">
                      <Network className="w-4 h-4 mr-1" />
                      DFA Graph
                    </TabsTrigger>
                    <TabsTrigger value="dfa" className="whitespace-nowrap">
                      DFA States
                    </TabsTrigger>
                    <TabsTrigger value="table" className="whitespace-nowrap">
                      Parse Table
                    </TabsTrigger>
                    <TabsTrigger value="trace" className="whitespace-nowrap">
                      Trace
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="grammar" className="mt-4">
                  <ResultsDisplay title="Grammar Analysis" data={result.grammar} />
                </TabsContent>

                <TabsContent value="nfa" className="mt-4">
                  {result.visualizations?.nfa ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground text-lg">NFA Visualization</h3>
                        <span className="text-xs text-muted-foreground">
                          ({result.nfa_states_count} states)
                        </span>
                      </div>
                      <div className="bg-background rounded-lg p-6 border border-border overflow-auto">
                        <div className="flex justify-center items-center min-h-[400px]">
                          <img 
                            src={result.visualizations.nfa} 
                            alt="NFA Graph - Non-deterministic Finite Automaton" 
                            className="max-w-full h-auto"
                            style={{ imageRendering: 'crisp-edges' }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Non-deterministic Finite Automaton (NFA) - Scroll to view entire graph
                      </p>
                    </div>
                  ) : (
                    <div className="bg-background rounded-lg p-8 border border-border text-center">
                      <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-sm">No NFA visualization available</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Make sure Graphviz is installed on the backend server
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="dfa-graph" className="mt-4">
                  {result.visualizations?.dfa ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Network className="w-5 h-5 text-accent" />
                        <h3 className="font-semibold text-foreground text-lg">DFA Visualization</h3>
                        <span className="text-xs text-muted-foreground">
                          ({result.dfa_states_count} states)
                        </span>
                      </div>
                      <div className="bg-background rounded-lg p-6 border border-border overflow-auto">
                        <div className="flex justify-center items-center min-h-[400px]">
                          <img 
                            src={result.visualizations.dfa} 
                            alt="DFA Graph - Deterministic Finite Automaton" 
                            className="max-w-full h-auto"
                            style={{ imageRendering: 'crisp-edges' }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Deterministic Finite Automaton (DFA) - Scroll to view entire graph
                      </p>
                    </div>
                  ) : (
                    <div className="bg-background rounded-lg p-8 border border-border text-center">
                      <Network className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-sm">No DFA visualization available</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Make sure Graphviz is installed on the backend server
                      </p>
                    </div>
                  )}
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