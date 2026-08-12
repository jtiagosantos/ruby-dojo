import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// Judge0 Ruby language ID
const RUBY_LANGUAGE_ID = 72;
const JUDGE0_URL = process.env.JUDGE0_URL ?? "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY ?? "";

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

interface RunResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testResults: TestResult[];
  output: string;
  error?: string;
}

function parseMiniTestOutput(output: string): TestResult[] {
  const results: TestResult[] = [];

  const summaryMatch = output.match(/(\d+) runs, (\d+) assertions, (\d+) failures, (\d+) errors/);
  if (!summaryMatch) return results;

  const verboseRegex = /(\w+)\s*=\s*[\d.]+\s*s\s*=\s*([.FE])/g;
  let match;
  while ((match = verboseRegex.exec(output)) !== null) {
    const [, name, status] = match;
    results.push({
      name: name.replace(/_/g, " "),
      passed: status === ".",
      message: status !== "." ? extractFailureMessage(output, name) : undefined,
    });
  }

  if (results.length === 0) {
    const runLine = output.match(/^[.FE]+/m);
    if (runLine) {
      [...runLine[0]].forEach((char, i) => {
        results.push({
          name: `Teste ${i + 1}`,
          passed: char === ".",
          message: char !== "." ? "Falhou" : undefined,
        });
      });
    }
  }

  return results;
}

function extractFailureMessage(output: string, testName: string): string {
  const regex = new RegExp(`${testName}[\\s\\S]*?\\n\\s+(.*?)\\n(?=\\n|[A-Z])`, "m");
  const match = output.match(regex);
  return match ? match[1].trim() : "Falhou";
}

async function executeWithJudge0(sourceCode: string): Promise<{ output: string; error: string; timedOut: boolean }> {
  const encoded = Buffer.from(sourceCode).toString("base64");

  // Submit
  const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": JUDGE0_API_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    body: JSON.stringify({
      language_id: RUBY_LANGUAGE_ID,
      source_code: encoded,
      cpu_time_limit: 10,
      wall_time_limit: 15,
    }),
  });

  if (!submitRes.ok) {
    const text = await submitRes.text();
    throw new Error(`Judge0 submit failed: ${submitRes.status} ${text}`);
  }

  const { token } = await submitRes.json() as { token: string };

  // Poll until done (max ~15s)
  const maxAttempts = 20;
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  for (let i = 0; i < maxAttempts; i++) {
    await delay(800);

    const pollRes = await fetch(
      `${JUDGE0_URL}/submissions/${token}?base64_encoded=true`,
      {
        headers: {
          "X-RapidAPI-Key": JUDGE0_API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    if (!pollRes.ok) continue;

    const data = await pollRes.json() as {
      status: { id: number; description: string };
      stdout: string | null;
      stderr: string | null;
      compile_output: string | null;
      message: string | null;
    };

    // status.id: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer,
    //            5=Time Limit Exceeded, 6=Compilation Error, 7-12=Runtime Errors
    if (data.status.id <= 2) continue; // still running

    const decode = (s: string | null) =>
      s ? Buffer.from(s, "base64").toString("utf-8") : "";

    const stdout = decode(data.stdout);
    const stderr = decode(data.stderr);
    const compileOutput = decode(data.compile_output);
    const output = stdout + stderr + compileOutput;

    const timedOut = data.status.id === 5;
    const execError = timedOut
      ? "Tempo limite excedido (10 segundos). Verifique loops infinitos."
      : "";

    return { output, error: execError, timedOut };
  }

  return { output: "", error: "Timeout ao aguardar execução.", timedOut: true };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { code, challengeId } = body;

    if (!code || !challengeId) {
      return NextResponse.json(
        { error: "Código e ID do desafio são obrigatórios" },
        { status: 400 }
      );
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { tests: true, points: true },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Desafio não encontrado" }, { status: 404 });
    }

    const fullCode = `# frozen_string_literal: false
${code}

# --- TESTES ---
require 'minitest/autorun'

${challenge.tests}
`;

    const { output, error: execError, timedOut } = await executeWithJudge0(fullCode);

    // Parse results
    const testResults = parseMiniTestOutput(output);
    const summaryMatch = output.match(/(\d+) runs, (\d+) assertions, (\d+) failures, (\d+) errors/);

    let passed = false;
    let totalTests = testResults.length;
    let passedTests = testResults.filter((t) => t.passed).length;
    let failedTests = testResults.filter((t) => !t.passed).length;

    if (summaryMatch) {
      const runs = parseInt(summaryMatch[1]);
      const failures = parseInt(summaryMatch[3]);
      const errors = parseInt(summaryMatch[4]);
      totalTests = runs;
      failedTests = failures + errors;
      passedTests = runs - failedTests;
      passed = failedTests === 0 && !timedOut && !execError;
    }

    const result: RunResult = {
      passed,
      totalTests,
      passedTests,
      failedTests,
      testResults,
      output: output.slice(0, 5000),
      error: (timedOut || execError) ? execError : undefined,
    };

    // Save submission — always, regardless of pass/fail
    try {
      await prisma.submission.create({
        data: {
          userId,
          challengeId,
          code,
          passed,
          score: passed ? challenge.points : 0,
          output: output.slice(0, 2000),
        },
      });

      if (passed) {
        const previousPass = await prisma.submission.findFirst({
          where: {
            userId,
            challengeId,
            passed: true,
            NOT: { createdAt: { gte: new Date(Date.now() - 5000) } },
          },
        });

        if (!previousPass) {
          await prisma.userSession.upsert({
            where: { userId },
            create: { userId, score: challenge.points },
            update: { score: { increment: challenge.points } },
          });
        }
      }
    } catch (dbErr) {
      console.error("Error saving submission:", dbErr);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("run-code error:", err);
    return NextResponse.json(
      {
        passed: false,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        testResults: [],
        output: "",
        error: "Erro interno ao executar o código",
      },
      { status: 500 }
    );
  }
}
