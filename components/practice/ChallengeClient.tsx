"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import confetti from "canvas-confetti";
import CommunitySolutions, { type CommunitySolution } from "@/components/practice/CommunitySolutions";

const CodeEditor = dynamic(() => import("@/components/practice/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-lg h-96 flex items-center justify-center"
      style={{ background: "var(--bg-code)", border: "1px solid var(--border-default)" }}
    >
      <span style={{ color: "var(--text-muted)" }}>Carregando editor...</span>
    </div>
  ),
});

interface Failure {
  index: number;
  expected: string;
  actual: string;
}

interface RunResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  failures: Failure[];
  error?: string;
}

interface ChallengeClientProps {
  challengeId: string;
  starterCode: string;
  initialCode?: string;
  communitySolutions?: CommunitySolution[];
}

export default function ChallengeClient({
  challengeId,
  starterCode,
  initialCode,
  communitySolutions = [],
}: ChallengeClientProps) {
  const [code, setCode] = useState(initialCode ?? starterCode);
  const [result, setResult] = useState<RunResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "output" | "solutions">("editor");
  const hasSolutions = communitySolutions.length > 0;
  const prevPassedRef = useRef(false);

  useEffect(() => {
    if (result?.passed && !prevPassedRef.current) {
      const colors = ["#c0392b", "#f5a89a", "#f0e8df", "#a78bfa", "#22c55e"];
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { x: 0.5, y: 0.6 },
        colors,
      });
    }
    prevPassedRef.current = result?.passed ?? false;
  }, [result]);

  const handleRun = useCallback(async () => {
    setLoading(true);
    setActiveTab("output");
    try {
      const res = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, challengeId }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        passed: false,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        failures: [],
        error: "Erro de rede ao executar o código.",
      });
    } finally {
      setLoading(false);
    }
  }, [code, challengeId]);

  const handleReset = () => {
    setCode(starterCode);
    setResult(null);
    setActiveTab("editor");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-t-xl"
        style={{
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Tabs */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {([
            { id: "editor", label: "✏️ Editor", labelShort: "Editor" },
            { id: "output", label: "📋 Resultado", labelShort: "Output" },
            ...(communitySolutions.length > 0
              ? [{ id: "solutions", label: `👥 Soluções (${communitySolutions.length})`, labelShort: `Soluções (${communitySolutions.length})` }]
              : []),
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="px-2 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0"
              style={{
                background: activeTab === tab.id ? "var(--bg-surface)" : "transparent",
                color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
                border:
                  activeTab === tab.id
                    ? "1px solid var(--border-default)"
                    : "1px solid transparent",
              }}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.labelShort}</span>
              {tab.id === "output" && result && (
                <span
                  className="ml-1.5 w-2 h-2 rounded-full inline-block"
                  style={{
                    background: result.passed ? "var(--success)" : "var(--error)",
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={loading}
            onClick={handleRun}
          >
            {loading ? "..." : <><span className="hidden sm:inline">▶ Executar Testes</span><span className="sm:hidden">▶ Executar</span></>}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 rounded-b-xl overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderTop: "none",
          minHeight: "300px",
        }}
      >
        {activeTab === "editor" ? (
          <div className="p-4">
            <CodeEditor value={code} onChange={setCode} height="min(45vh, 480px)" />
          </div>
        ) : activeTab === "solutions" ? (
          <div className="p-5 overflow-y-auto" style={{ height: "min(45vh, 480px)", minHeight: "300px" }}>
            <CommunitySolutions solutions={communitySolutions} />
          </div>
        ) : (
          <div className="p-6 overflow-y-auto" style={{ height: "min(45vh, 480px)", minHeight: "300px" }}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div
                  className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: "var(--accent-red)", borderTopColor: "transparent" }}
                />
                <p style={{ color: "var(--text-secondary)" }}>Executando seu código Ruby...</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* Summary */}
                <div
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{
                    background: result.passed ? "var(--success-bg)" : "var(--error-bg)",
                    border: `1px solid ${result.passed ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  }}
                >
                  <div className="text-3xl">{result.passed ? "✅" : "❌"}</div>
                  <div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: result.passed ? "var(--success)" : "var(--error)" }}
                    >
                      {result.passed ? "Todos os testes passaram!" : "Testes falharam"}
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {result.passedTests}/{result.totalTests} testes passaram
                    </div>
                  </div>
                </div>

                {/* Test breakdown */}
                <div>
                  <h4
                    className="text-sm font-semibold mb-3 uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Detalhes dos testes
                  </h4>
                  <div className="space-y-2">
                    {Array.from({ length: result.totalTests }).map((_, i) => {
                      const testNumber = i + 1;
                      const failure = result.failures.find((f) => f.index === testNumber);
                      // If failures array is empty but overall result failed, mark all as failed
                      const hasDetailedFailures = result.failures.length > 0;
                      const passed = hasDetailedFailures ? !failure : result.passed;
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg"
                          style={{
                            background: passed
                              ? "rgba(34,197,94,0.05)"
                              : "rgba(239,68,68,0.05)",
                            border: `1px solid ${passed ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                          }}
                        >
                          <span
                            className="shrink-0 mt-0.5 text-sm font-bold"
                            style={{ color: passed ? "var(--success)" : "var(--error)" }}
                          >
                            {passed ? "✓" : "✗"}
                          </span>
                          <div className="flex-1">
                            <div
                              className="text-sm font-medium"
                              style={{ color: passed ? "var(--success)" : "var(--error)" }}
                            >
                              Teste {testNumber}
                            </div>
                            {failure && (
                              <div className="mt-2 flex gap-4">
                                <div
                                  className="flex-1 px-3 py-2 rounded-md text-xs font-mono"
                                  style={{
                                    background: "rgba(34,197,94,0.08)",
                                    border: "1px solid rgba(34,197,94,0.2)",
                                  }}
                                >
                                  <span style={{ color: "var(--text-muted)" }}>esperado: </span>
                                  <span style={{ color: "var(--success)" }}>{failure.expected}</span>
                                </div>
                                <div
                                  className="flex-1 px-3 py-2 rounded-md text-xs font-mono"
                                  style={{
                                    background: "rgba(239,68,68,0.08)",
                                    border: "1px solid rgba(239,68,68,0.2)",
                                  }}
                                >
                                  <span style={{ color: "var(--text-muted)" }}>recebido: </span>
                                  <span style={{ color: "var(--error)" }}>{failure.actual}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {result.error && (
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      background: "var(--error-bg)",
                      border: "1px solid rgba(239,68,68,0.3)",
                    }}
                  >
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--error)" }}>
                      Erro
                    </p>
                    <pre
                      className="text-xs font-mono"
                      style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}
                    >
                      {result.error}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="text-5xl opacity-30">🧪</div>
                <p className="text-lg" style={{ color: "var(--text-muted)" }}>
                  Clique em{" "}
                  <strong style={{ color: "var(--text-secondary)" }}>Executar Testes</strong>{" "}
                  para ver os resultados
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
