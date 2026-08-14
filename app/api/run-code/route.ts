import { NextRequest, NextResponse } from "next/server";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const lambda = new LambdaClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface LambdaFailure {
  index: number;
  expected: string;
  actual: string;
}

interface LambdaResult {
  passed: boolean;
  total: number;
  successful: number;
  failed: number;
  failures: LambdaFailure[];
}

interface RunResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  failures: LambdaFailure[];
  error?: string;
}

function formatRubyString(text: string): string {
  return text.replace(/\r\n/g, "\n");
}

export async function POST(req: NextRequest) {
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

    // Invoke Lambda
    const payload = {
      solution: formatRubyString(code),
      tests: formatRubyString(challenge.tests),
    };

    const command = new InvokeCommand({
      FunctionName: "ruby-dojo-solution-runner",
      InvocationType: "RequestResponse",
      Payload: JSON.stringify(payload),
    });

    const lambdaResponse = await lambda.send(command);

    if (!lambdaResponse.Payload) {
      return NextResponse.json(
        {
          passed: false,
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          failures: [],
          error: "Sem resposta da Lambda",
        },
        { status: 500 }
      );
    }

    const rawPayload =
      lambdaResponse.Payload instanceof Uint8Array
        ? new TextDecoder().decode(lambdaResponse.Payload)
        : String(lambdaResponse.Payload);

    console.log("[run-code] Lambda raw payload:", rawPayload);

    let parsed = JSON.parse(rawPayload);

    // Handle double-encoded or wrapped responses
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }
    if (parsed.body && typeof parsed.body === "string") {
      parsed = JSON.parse(parsed.body);
    }

    const lambdaResult: LambdaResult = parsed;

    // Use `failures.length` and `passed` as source of truth since
    // the Lambda may return inconsistent successful/failed counts.
    const failedTests = lambdaResult.failures.length;
    const totalTests = lambdaResult.total;
    const passedTests = totalTests - failedTests;

    const result: RunResult = {
      passed: lambdaResult.passed,
      totalTests,
      passedTests,
      failedTests,
      failures: lambdaResult.failures,
    };

    // Save submission
    try {
      await prisma.submission.create({
        data: {
          userId,
          challengeId,
          code,
          passed: result.passed,
          score: result.passed ? challenge.points : 0,
          output: JSON.stringify(lambdaResult).slice(0, 2000),
        },
      });

      // Award points on first pass only
      if (result.passed) {
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
        failures: [],
        error: "Erro interno ao executar o código",
      },
      { status: 500 }
    );
  }
}
