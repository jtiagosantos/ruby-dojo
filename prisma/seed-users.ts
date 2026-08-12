/**
 * seed-users.ts
 *
 * Popula o banco com usuários fictícios e submissões bem-sucedidas,
 * permitindo testar a tela de ranking e a aba de soluções da comunidade.
 *
 * Uso:
 *   npm run db:seed-users
 *
 * O seed é idempotente: re-executar não duplica dados.
 */

import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const dbPath = dbUrl.startsWith("file:") ? dbUrl.slice(5) : dbUrl;
const resolvedPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.resolve(process.cwd(), dbPath);
const adapter = new PrismaBetterSqlite3({ url: resolvedPath });
const prisma = new PrismaClient({
  adapter,
} as ConstructorParameters<typeof PrismaClient>[0]);

// ─── Usuários fictícios ───────────────────────────────────────────────────────

const FAKE_USERS = [
  {
    name: "Ana Souza",
    email: "ana@rubydojo.dev",
    image: "https://i.pravatar.cc/300?img=1",
    // Quantos desafios vai resolver (dos primeiros N por ordem)
    solveCount: 20,
  },
  {
    name: "Bruno Lima",
    email: "bruno@rubydojo.dev",
    image: "https://i.pravatar.cc/300?img=5",
    solveCount: 15,
  },
  {
    name: "Carla Mendes",
    email: "carla@rubydojo.dev",
    image: "https://i.pravatar.cc/300?img=9",
    solveCount: 12,
  },
  {
    name: "Diego Ferreira",
    email: "diego@rubydojo.dev",
    image: "https://i.pravatar.cc/300?img=12",
    solveCount: 8,
  },
  {
    name: "Elisa Costa",
    email: "elisa@rubydojo.dev",
    image: "https://i.pravatar.cc/300?img=16",
    solveCount: 5,
  },
];

// ─── Soluções de exemplo por título de desafio ────────────────────────────────
// Mapeamos pelo título porque o ID muda a cada migrate reset.
// Se um desafio não tiver solução mapeada aqui, usamos a solução genérica.

const SOLUTIONS: Record<string, string[]> = {
  // ── Fundamentos da Linguagem Ruby ────────────────────────────────────────

  "Saudação": [
    `def greet(name)\n  "Olá, #{name}!"\nend`,
    `def greet(name)\n  return "Olá, " + name + "!"\nend`,
    `def greet(name)\n  msg = "Olá, %s!" % name\n  msg\nend`,
  ],

  "Soma de dois números": [
    `def sum(a, b)\n  a + b\nend`,
    `def sum(a, b)\n  return a + b\nend`,
    `def sum(a, b)\n  result = a + b\n  result\nend`,
  ],

  "Maior de idade": [
    `def adult?(age)\n  age >= 18\nend`,
    `def adult?(age)\n  return true if age >= 18\n  false\nend`,
  ],

  "Número par": [
    `def even?(number)\n  number % 2 == 0\nend`,
    `def even?(number)\n  number.even?\nend`,
    `def even?(number)\n  (number % 2).zero?\nend`,
  ],

  "Classificação de idade": [
    `def age_group(age)\n  if age < 12\n    "criança"\n  elsif age < 18\n    "adolescente"\n  elsif age < 60\n    "adulto"\n  else\n    "idoso"\n  end\nend`,
    `def age_group(age)\n  case age\n  when 0..11 then "criança"\n  when 12..17 then "adolescente"\n  when 18..59 then "adulto"\n  else "idoso"\n  end\nend`,
  ],

  "Calculadora simples": [
    `def calculate(a, b, operation)\n  case operation\n  when "+" then a + b\n  when "-" then a - b\n  when "*" then a * b\n  when "/" then a / b\n  end\nend`,
    `def calculate(a, b, operation)\n  if operation == "+"\n    a + b\n  elsif operation == "-"\n    a - b\n  elsif operation == "*"\n    a * b\n  else\n    a / b\n  end\nend`,
  ],

  "Maior número": [
    `def largest(a, b, c)\n  [a, b, c].max\nend`,
    `def largest(a, b, c)\n  if a >= b && a >= c\n    a\n  elsif b >= c\n    b\n  else\n    c\n  end\nend`,
  ],

  "Contagem regressiva": [
    `def countdown(number)\n  (0..number).to_a.reverse\nend`,
    `def countdown(number)\n  result = []\n  number.downto(0) { |i| result << i }\n  result\nend`,
    `def countdown(number)\n  number.downto(0).to_a\nend`,
  ],

  "Soma dos números": [
    `def sum_until(number)\n  (1..number).sum\nend`,
    `def sum_until(number)\n  (1..number).reduce(0, :+)\nend`,
    `def sum_until(number)\n  total = 0\n  1.upto(number) { |i| total += i }\n  total\nend`,
  ],

  "Tabuada": [
    `def multiplication_table(number)\n  (1..10).map { |i| number * i }\nend`,
    `def multiplication_table(number)\n  result = []\n  (1..10).each { |i| result << number * i }\n  result\nend`,
  ],

  "Estatísticas de uma lista": [
    `def statistics(numbers)\n  {\n    count: numbers.length,\n    sum: numbers.sum,\n    min: numbers.min,\n    max: numbers.max\n  }\nend`,
    `def statistics(numbers)\n  { count: numbers.size, sum: numbers.reduce(:+), min: numbers.min, max: numbers.max }\nend`,
  ],

  "Contar números pares": [
    `def count_even(numbers)\n  numbers.count(&:even?)\nend`,
    `def count_even(numbers)\n  numbers.select(&:even?).length\nend`,
    `def count_even(numbers)\n  numbers.count { |n| n % 2 == 0 }\nend`,
  ],

  "Transformar nomes": [
    `def uppercase_names(names)\n  names.map(&:upcase)\nend`,
    `def uppercase_names(names)\n  names.map { |name| name.upcase }\nend`,
  ],

  // ── Collections + Enumerable ─────────────────────────────────────────────

  "Dobrar números": [
    `def double_numbers(numbers)\n  numbers.map { |n| n * 2 }\nend`,
    `def double_numbers(numbers)\n  numbers.map { |n| n + n }\nend`,
  ],

  "Selecionar números pares": [
    `def even_numbers(numbers)\n  numbers.select(&:even?)\nend`,
    `def even_numbers(numbers)\n  numbers.select { |n| n % 2 == 0 }\nend`,
  ],

  "Selecionar números positivos": [
    `def positive_numbers(numbers)\n  numbers.select { |n| n > 0 }\nend`,
    `def positive_numbers(numbers)\n  numbers.reject { |n| n <= 0 }\nend`,
  ],

  "Encontrar o primeiro número maior que 10": [
    `def first_number_greater_than_ten(numbers)\n  numbers.find { |n| n > 10 }\nend`,
    `def first_number_greater_than_ten(numbers)\n  numbers.detect { |n| n > 10 }\nend`,
  ],

  "Verificar se existe um número negativo": [
    `def contains_negative?(numbers)\n  numbers.any? { |n| n < 0 }\nend`,
    `def contains_negative?(numbers)\n  numbers.any?(&:negative?)\nend`,
  ],

  "Verificar se todos são maiores de idade": [
    `def all_adults?(ages)\n  ages.all? { |age| age >= 18 }\nend`,
    `def all_adults?(ages)\n  ages.none? { |age| age < 18 }\nend`,
  ],

  "Contar números pares": [
    `def count_even_numbers(numbers)\n  numbers.count(&:even?)\nend`,
    `def count_even_numbers(numbers)\n  numbers.select { |n| n.even? }.size\nend`,
  ],

  "Somar números": [
    `def sum_numbers(numbers)\n  numbers.sum\nend`,
    `def sum_numbers(numbers)\n  numbers.reduce(0, :+)\nend`,
    `def sum_numbers(numbers)\n  numbers.inject(0) { |acc, n| acc + n }\nend`,
  ],

  "Encontrar o maior número": [
    `def maximum_number(numbers)\n  numbers.max\nend`,
    `def maximum_number(numbers)\n  numbers.reduce { |max, n| n > max ? n : max }\nend`,
  ],

  "Ordenar usuários por idade": [
    `def sort_users_by_age(users)\n  users.sort_by { |u| u[:age] }\nend`,
    `def sort_users_by_age(users)\n  users.sort { |a, b| a[:age] <=> b[:age] }\nend`,
  ],

  "Agrupar números por paridade": [
    `def group_by_parity(numbers)\n  numbers.group_by(&:even?)\nend`,
    `def group_by_parity(numbers)\n  numbers.group_by { |n| n.even? }\nend`,
  ],

  "Filtrar usuários ativos": [
    `def active_users(users)\n  users.select { |u| u[:active] }\nend`,
    `def active_users(users)\n  users.filter { |u| u[:active] == true }\nend`,
  ],

  "Calcular total de preços": [
    `def total_price(products)\n  products.sum { |p| p[:price] }\nend`,
    `def total_price(products)\n  products.map { |p| p[:price] }.sum\nend`,
    `def total_price(products)\n  products.reduce(0) { |total, p| total + p[:price] }\nend`,
  ],

  "Pipeline de processamento": [
    `def process_numbers(numbers)\n  numbers\n    .reject { |n| n < 0 }\n    .select { |n| n.even? }\n    .map { |n| n * 2 }\n    .sort\nend`,
    `def process_numbers(numbers)\n  numbers.select { |n| n >= 0 && n.even? }.map { |n| n * 2 }.sort\nend`,
  ],
};

// ─── Solução genérica (fallback) ─────────────────────────────────────────────

function genericSolution(starterCode: string): string {
  // Retorna o starter code com um comentário indicando solução fictícia
  return starterCode.replace(
    /# implemente aqui|# seu código aqui/g,
    "# solução gerada pelo seed"
  ) + "\n# implementação correta omitida no seed";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickSolution(title: string, starterCode: string, userIndex: number): string {
  const solutions = SOLUTIONS[title];
  if (solutions && solutions.length > 0) {
    return solutions[userIndex % solutions.length];
  }
  return genericSolution(starterCode);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seed de usuários e submissões...\n");

  // 1. Buscar todos os desafios ordenados
  const challenges = await prisma.challenge.findMany({
    orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
    select: { id: true, title: true, points: true, starterCode: true },
  });

  if (challenges.length === 0) {
    console.error("❌ Nenhum desafio encontrado. Rode o sync do Notion primeiro.");
    process.exit(1);
  }

  console.log(`   ${challenges.length} desafio(s) encontrado(s) no banco\n`);

  // 2. Criar usuários fictícios (upsert por email)
  console.log("👤 Criando usuários...\n");

  for (const userData of FAKE_USERS) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { name: userData.name, image: userData.image },
      create: { name: userData.name, email: userData.email, image: userData.image },
    });

    const targetChallenges = challenges.slice(0, userData.solveCount);

    let submissionsCreated = 0;
    let submissionsSkipped = 0;

    for (let i = 0; i < targetChallenges.length; i++) {
      const challenge = targetChallenges[i];

      // Verificar se já tem submissão bem-sucedida para evitar duplicatas
      const existing = await prisma.submission.findFirst({
        where: { userId: user.id, challengeId: challenge.id, passed: true },
      });

      if (existing) {
        submissionsSkipped++;
        continue;
      }

      const code = pickSolution(challenge.title, challenge.starterCode, FAKE_USERS.indexOf(userData));

      // Datas espalhadas nos últimos 30 dias, do mais antigo ao mais novo
      const createdAt = daysAgo(targetChallenges.length - i + Math.floor(Math.random() * 3));

      await prisma.submission.create({
        data: {
          userId: user.id,
          challengeId: challenge.id,
          code,
          passed: true,
          score: challenge.points,
          output: "1 runs, 1 assertions, 0 failures, 0 errors\n\n1 tests passed.",
          createdAt,
        },
      });

      submissionsCreated++;
    }

    // Calcular score total das submissões únicas aprovadas
    const passedSubs = await prisma.submission.findMany({
      where: { userId: user.id, passed: true },
      select: { challengeId: true, score: true },
      distinct: ["challengeId"],
    });
    const totalScore = passedSubs.reduce((acc, s) => acc + s.score, 0);

    await prisma.userSession.upsert({
      where: { userId: user.id },
      create: { userId: user.id, score: totalScore },
      update: { score: totalScore },
    });

    const status = submissionsSkipped > 0
      ? `${submissionsCreated} criadas, ${submissionsSkipped} já existiam`
      : `${submissionsCreated} criadas`;

    console.log(`   ✅ ${userData.name.padEnd(20)} — ${targetChallenges.length} desafios resolvidos (${status}) — ${totalScore}pts`);
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Seed concluído!
━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main()
  .catch((err) => {
    console.error("❌ Erro no seed:", err.message ?? err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
