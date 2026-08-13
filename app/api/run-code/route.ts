import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const execAsync = promisify(exec);

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

export async function POST(req: NextRequest) {
  let tempFile: string | null = null;

  try {
    // Require authentication
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

    // Fetch challenge
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { tests: true, points: true },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Desafio não encontrado" }, { status: 404 });
    }

    // Create temp file
    const fileName = `ruby_dojo_${Date.now()}_${Math.random().toString(36).slice(2)}.rb`;
    tempFile = join(tmpdir(), fileName);

    const fullCode = `# frozen_string_literal: false
${code}

# --- TESTES ---
require 'minitest/autorun'

${challenge.tests}
`;

    await writeFile(tempFile, fullCode, "utf-8");

    // Execute ruby
    let output = "";
    let execError = "";
    let timedOut = false;

    try {
      const rubyPath = process.env.RUBY_PATH || "ruby";
      const { stdout, stderr } = await execAsync(`${rubyPath} -W0 "${tempFile}"`, {
        timeout: 10000,
        maxBuffer: 1024 * 1024,
      });
      output = stdout + stderr;
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string; killed?: boolean; message?: string };
      output = (execErr.stdout || "") + (execErr.stderr || "");
      if (execErr.killed) {
        timedOut = true;
        execError = "Tempo limite excedido (10 segundos). Verifique loops infinitos.";
      } else if (!output) {
        execError = execErr.message || "Erro desconhecido na execução";
      }
    }

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
      error: timedOut ? execError : undefined,
    };

    // Save submission — always, regardless of pass/fail (for audit purposes)
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

      // Award points on first pass only
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
  } finally {
    if (tempFile) unlink(tempFile).catch(() => {});
  }
}
