"use client"

interface ResultsDisplayProps {
  title: string
  data: unknown
}

function DFAStateCard({ state, index }: { state: any; index: number }) {
  return (
    <div className="bg-background rounded-lg p-4 border border-border hover:border-primary/50 transition-colors">
      {/* State Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 bg-primary/20 text-primary-foreground text-sm font-bold rounded-full">
          I{state.id}
        </span>
        <span className="text-xs text-muted-foreground">({state.items.length} items)</span>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {state.items.map((item: any, idx: number) => {
          // Usar dot_position en lugar de dot_pos
          const bodyWithDot = [
            ...item.body.slice(0, item.dot_position), 
            "•", 
            ...item.body.slice(item.dot_position)
          ]
          return (
            <div key={idx} className="text-xs font-mono bg-secondary/30 rounded p-2 text-foreground">
              <span className="text-foreground font-semibold">{item.head}</span>
              <span className="text-muted-foreground"> → </span>
              <span>{bodyWithDot.join(" ")}</span>
              <span className="text-muted-foreground">, {item.lookahead}</span>
            </div>
          )
        })}
      </div>

      {/* Transitions and Reductions */}
      <div className="grid grid-cols-2 gap-3">
        {/* Transitions */}
        {Object.keys(state.transitions || {}).length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground font-semibold mb-2">Transitions</p>
            <div className="space-y-1">
              {Object.entries(state.transitions).map(([symbol, targetId]: [string, any]) => (
                <div key={symbol} className="text-xs">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded font-mono">
                    {symbol} → I{targetId}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reductions */}
        {Object.keys(state.reductions || {}).length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground font-semibold mb-2">Reductions</p>
            <div className="space-y-1">
              {Object.entries(state.reductions).map(([symbol, item]: [string, any]) => (
                <div key={symbol} className="text-xs">
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded font-mono">
                    {symbol}: {item.head} → {item.body.join(" ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ParseTableDisplay({ data }: { data: any }) {
  const action = data.action || {}
  const goto = data.goto || {}
  const rules = data.rules || []

  return (
    <div className="space-y-6">
      {/* Rules Reference */}
      {rules.length > 0 && (
        <div className="bg-background rounded-lg p-4 border border-border">
          <p className="text-sm font-semibold text-foreground mb-3">Production Rules</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {rules.map((rule: any) => (
              <div key={rule.num} className="text-xs font-mono text-foreground">
                <span className="text-muted-foreground">r{rule.num}:</span>
                <span className="text-foreground ml-2 font-semibold">{rule.head}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-primary-foreground">{rule.body.join(" ") || "ε"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTION Table */}
      {Object.keys(action).length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">ACTION Table</p>
          <div className="bg-background rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left text-muted-foreground font-semibold">State</th>
                    {Object.keys(action)
                      .flatMap((state) => Object.keys(action[state]))
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .sort()
                      .map((symbol) => (
                        <th key={symbol} className="px-3 py-3 text-center text-muted-foreground font-semibold">
                          {symbol}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(action).map(([state, actions]: [string, any], idx) => (
                    <tr key={state} className={idx % 2 === 0 ? "bg-background" : "bg-secondary/20"}>
                      <td className="px-4 py-3 text-primary-foreground font-mono font-semibold">{state}</td>
                      {Object.keys(action)
                        .flatMap((s) => Object.keys(action[s]))
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .sort()
                        .map((symbol) => {
                          const actionValue = actions[symbol] || ""
                          let bgColor = "bg-secondary/30 text-muted-foreground"
                          if (actionValue.startsWith("s")) bgColor = "bg-blue-500/20 text-blue-400"
                          else if (actionValue.startsWith("r")) bgColor = "bg-orange-500/20 text-orange-400"
                          else if (actionValue === "acc") bgColor = "bg-green-500/20 text-green-400"

                          return (
                            <td key={symbol} className="px-3 py-3 text-center">
                              {actionValue && (
                                <span className={`px-2 py-1 rounded text-xs font-mono ${bgColor}`}>{actionValue}</span>
                              )}
                            </td>
                          )
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GOTO Table */}
      {Object.keys(goto).length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">GOTO Table</p>
          <div className="bg-background rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left text-muted-foreground font-semibold">State</th>
                    {Object.keys(goto)
                      .flatMap((state) => Object.keys(goto[state]))
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .sort()
                      .map((symbol) => (
                        <th key={symbol} className="px-3 py-3 text-center text-muted-foreground font-semibold">
                          {symbol}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(goto).map(([state, gotos]: [string, any], idx) => (
                    <tr key={state} className={idx % 2 === 0 ? "bg-background" : "bg-secondary/20"}>
                      <td className="px-4 py-3 text-primary-foreground font-mono font-semibold">{state}</td>
                      {Object.keys(goto)
                        .flatMap((s) => Object.keys(goto[s]))
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .sort()
                        .map((symbol) => {
                          const gotoValue = gotos[symbol] || ""
                          return (
                            <td key={symbol} className="px-3 py-3 text-center">
                              {gotoValue && (
                                <span className="px-2 py-1 rounded text-xs font-mono bg-purple-500/20 text-purple-400">
                                  {gotoValue}
                                </span>
                              )}
                            </td>
                          )
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ParseTraceDisplay({ data }: { data: any }) {
  const steps = data.steps || []
  const accepted = data.accepted || false
  const error = data.error || null

  return (
    <div className="space-y-4">
      {/* Status */}
      <div
        className={`rounded-lg p-4 border ${
          accepted
            ? "bg-green-500/10 border-green-500/30 text-green-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}
      >
        <p className="text-sm font-semibold">{accepted ? "✓ Cadena aceptada" : "✗ Cadena rechazada"}</p>
        {error && <p className="text-xs mt-1 text-muted-foreground">{error}</p>}
      </div>

      {/* Steps Table */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">DERIVACIÓN LR(1)</p>
        <div className="bg-background rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b-2 border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left text-muted-foreground font-semibold">Paso</th>
                  <th className="px-4 py-3 text-left text-muted-foreground font-semibold">Pila</th>
                  <th className="px-4 py-3 text-left text-muted-foreground font-semibold">Entrada</th>
                  <th className="px-4 py-3 text-center text-muted-foreground font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step: any, idx: number) => (
                  <tr
                    key={idx}
                    className={`border-b border-border last:border-b-0 ${
                      idx % 2 === 0 ? "bg-background" : "bg-secondary/20"
                    }`}
                  >
                    <td className="px-4 py-3 text-muted-foreground">{step.step}</td>
                    <td className="px-4 py-3 text-foreground">
                      {step.stack.map((item: any, i: number) => (
                        <span key={i}>
                          {typeof item === 'number' ? (
                            <span className="text-primary-foreground">{item}</span>
                          ) : (
                            <span className="text-accent">{item}</span>
                          )}
                          {i < step.stack.length - 1 && " "}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {step.input.join(" ")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded font-semibold ${
                          step.action.startsWith("s")
                            ? "bg-blue-500/20 text-blue-400"
                            : step.action.startsWith("r")
                              ? "bg-orange-500/20 text-orange-400"
                              : step.action === "acc"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {step.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsDisplay({ title, data }: ResultsDisplayProps) {
  // Parse grammar data into readable format
  if (title === "Grammar Analysis" && typeof data === "object" && data !== null) {
    const grammar = data as {
      start_symbol: string
      non_terminals: string[]
      terminals: string[]
      productions: Record<string, string[]>
      first: Record<string, string[]>
    }

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">{title}</h3>

        {/* Start Symbol */}
        <div className="bg-background rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Start Symbol</p>
          <p className="text-sm font-mono text-foreground">{grammar.start_symbol}</p>
        </div>

        {/* Terminals */}
        <div className="bg-background rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Terminals</p>
          <div className="flex flex-wrap gap-2">
            {grammar.terminals.map((term) => (
              <span key={term} className="px-2 py-1 bg-primary/20 text-primary-foreground text-xs rounded font-mono">
                {term}
              </span>
            ))}
          </div>
        </div>

        {/* Non-Terminals */}
        <div className="bg-background rounded-lg p-4 border border-border">
          <p className="text-xs text-foreground mb-2">Non-Terminals</p>
          <div className="flex flex-wrap gap-2">
            {grammar.non_terminals.map((nt) => (
              <span key={nt} className="px-2 py-1 bg-accent/20 text-foreground text-xs rounded font-mono">
                {nt}
              </span>
            ))}
          </div>
        </div>

        {/* Productions */}
        <div className="bg-background rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-3">Productions</p>
          <div className="space-y-2">
            {Object.entries(grammar.productions).map(([lhs, rhsList]) => (
              <div key={lhs} className="text-sm font-mono text-foreground">
                <span className="text-foreground font-semibold">{lhs}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-primary-foreground">{rhsList.join(" | ")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FIRST Sets */}
        <div className="bg-background rounded-lg p-4 border border-border">
          <p className="text-xs text-muted-foreground mb-3">FIRST Sets</p>
          <div className="space-y-2">
            {Object.entries(grammar.first).map(([symbol, firstSet]) => (
              <div key={symbol} className="text-sm font-mono text-foreground">
                <span className="text-foreground font-semibold">FIRST({symbol})</span>
                <span className="text-muted-foreground"> = </span>
                <span className="text-primary-foreground">{"{" + firstSet.join(", ") + "}"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (title === "DFA States" && Array.isArray(data)) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {data.length > 0 ? (
          <div className="grid gap-4">
            {data.map((state, idx) => (
              <DFAStateCard key={idx} state={state} index={idx} />
            ))}
          </div>
        ) : (
          <div className="bg-background rounded-lg p-4 border border-border">
            <p className="text-muted-foreground text-sm">No DFA states available</p>
          </div>
        )}
      </div>
    )
  }

  if (title === "Parsing Table" && typeof data === "object" && data !== null) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <ParseTableDisplay data={data} />
      </div>
    )
  }

  if (title === "Parse Trace" && typeof data === "object" && data !== null) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <ParseTraceDisplay data={data} />
      </div>
    )
  }

  // Default fallback for other data types
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <div className="bg-background rounded-lg p-4 border border-border max-h-96 overflow-y-auto">
        <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}
