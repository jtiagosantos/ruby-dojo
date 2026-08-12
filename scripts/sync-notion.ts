import "dotenv/config";
import { Client } from "@notionhq/client";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const dbPath = dbUrl.startsWith("file:") ? dbUrl.slice(5) : dbUrl;
const resolvedPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
const adapter = new PrismaBetterSqlite3({ url: resolvedPath });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

// ─── helpers ────────────────────────────────────────────────────────────────

function richText(prop: { rich_text: Array<{ plain_text: string }> }): string {
  return prop.rich_text.map((t) => t.plain_text).join("").trim();
}

function titleText(prop: { title: Array<{ plain_text: string }> }): string {
  return prop.title.map((t) => t.plain_text).join("").trim();
}

// Convert Notion's HTML table format to Markdown table
function convertHtmlTables(input: string): string {
  return input.replace(
    /<table[^>]*>([\s\S]*?)<\/table>/g,
    (_, body: string) => {
      const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
      if (rows.length === 0) return "";

      const parseRow = (row: string) =>
        [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) =>
          m[1].trim().replace(/\n/g, " ")
        );

      const parsed = rows.map(parseRow);
      if (parsed.length === 0) return "";

      const header = parsed[0];
      const separator = header.map(() => "---");
      const dataRows = parsed.slice(1);

      const toMdRow = (cols: string[]) => `| ${cols.join(" | ")} |`;

      return [toMdRow(header), toMdRow(separator), ...dataRows.map(toMdRow)].join("\n");
    }
  );
}

function normaliseMarkdown(raw: string): string {
  return convertHtmlTables(raw)
    .replace(/<empty-block\/>/g, "")
    .replace(/\t/g, "  ")
    // Ensure --- is always preceded by a blank line so it's treated as <hr>
    // and not as a Setext heading (which would turn the line above into <h2>)
    .replace(/([^\n])\n---/g, "$1\n\n---")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchPageMarkdown(pageId: string): Promise<string> {
  try {
    const res = await notion.pages.retrieveMarkdown({ page_id: pageId });
    return normaliseMarkdown((res as { markdown: string }).markdown);
  } catch {
    return "";
  }
}

async function queryAllRows(dataSourceId: string): Promise<Array<Record<string, unknown>>> {
  const rows: Array<Record<string, unknown>> = [];
  let cursor: string | undefined = undefined;
  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
    } as Parameters<typeof notion.dataSources.query>[0]);
    rows.push(...(res.results as Array<Record<string, unknown>>));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return rows;
}

// Parse the page body into description, starterCode and tests
// by splitting on ## Description / ## Starter Code / ## Tests headings
function parseChallengePage(markdown: string): {
  description: string;
  starterCode: string;
  tests: string;
} | null {
  const sections: Record<string, string> = {};
  const parts = markdown.split(/^## /m);

  for (const part of parts) {
    if (!part.trim()) continue;
    const newline = part.indexOf("\n");
    if (newline === -1) continue;
    const heading = part.slice(0, newline).trim().toLowerCase();
    const body = part.slice(newline + 1).trim();
    sections[heading] = body;
  }

  const stripDivider = (s: string) => s.replace(/\n?---\s*$/m, "").trim();

  const description = stripDivider(sections["description"] ?? "");
  const starterCodeRaw = stripDivider(sections["starter code"] ?? "");
  const testsRaw = stripDivider(sections["tests"] ?? "");

  if (!description || !starterCodeRaw || !testsRaw) return null;

  // Strip ```ruby ... ``` fences and trailing --- dividers
  const stripFence = (s: string) =>
    s.replace(/^```(?:ruby)?\n?/m, "").replace(/\n?```[\s\S]*$/, "").replace(/\n?---\s*$/m, "").trim();

  return {
    description,
    starterCode: stripFence(starterCodeRaw),
    tests: stripFence(testsRaw),
  };
}

// ─── sync modules ────────────────────────────────────────────────────────────

// Returns a map of Notion page id → DB module id
async function syncModules(): Promise<Map<string, string>> {
  const dataSourceId = process.env.NOTION_MODULES_DB_ID!;
  console.log("📚 Sincronizando módulos...\n");

  const rows = await queryAllRows(dataSourceId);
  console.log(`   ${rows.length} módulo(s) encontrado(s) no Notion`);

  let created = 0, updated = 0, skipped = 0, deleted = 0;

  // Map: notion page id → db module id
  const moduleMap = new Map<string, string>();
  const syncedSlugs = new Set<string>();

  for (const row of rows) {
    const page = row as {
      id: string;
      properties: {
        Title: { title: Array<{ plain_text: string }> };
        Slug: { rich_text: Array<{ plain_text: string }> };
        Description: { rich_text: Array<{ plain_text: string }> };
        Icon: { rich_text: Array<{ plain_text: string }> };
        Order: { number: number | null };
      };
    };

    const title = titleText(page.properties.Title);
    const slug = richText(page.properties.Slug);
    const description = richText(page.properties.Description);
    const icon = richText(page.properties.Icon) || "📚";
    const order = page.properties.Order.number ?? 0;
    const content = await fetchPageMarkdown(page.id);

    if (!slug) {
      console.warn(`   ⚠️  Sem Slug — ignorado: "${title || "(sem título)"}"`);
      skipped++;
      continue;
    }
    if (!title) {
      console.warn(`   ⚠️  Sem Title — ignorado (slug: ${slug})`);
      skipped++;
      continue;
    }

    syncedSlugs.add(slug);

    const existing = await prisma.module.findUnique({ where: { slug } });

    if (existing) {
      await prisma.module.update({
        where: { slug },
        data: { title, description, icon, order, content },
      });
      console.log(`   ✏️  Atualizado: [${String(order).padStart(2, "0")}] ${title}`);
      moduleMap.set(page.id, existing.id);
      updated++;
    } else {
      const created_ = await prisma.module.create({
        data: { slug, title, description, icon, order, content },
      });
      console.log(`   ✅  Criado:    [${String(order).padStart(2, "0")}] ${title}`);
      moduleMap.set(page.id, created_.id);
      created++;
    }
  }

  // Delete modules that no longer exist in Notion (only if sync returned results)
  if (syncedSlugs.size > 0) {
    const allModules = await prisma.module.findMany({ select: { id: true, slug: true, title: true } });
    for (const mod of allModules) {
      if (!syncedSlugs.has(mod.slug)) {
          const modChallenges = await prisma.challenge.findMany({ where: { moduleId: mod.id }, select: { id: true } });
        const modChallengeIds = modChallenges.map((c) => c.id);
        await prisma.submission.deleteMany({ where: { challengeId: { in: modChallengeIds } } });
        await prisma.challenge.deleteMany({ where: { moduleId: mod.id } });
        await prisma.module.delete({ where: { id: mod.id } });
        console.log(`   🗑️  Deletado:  ${mod.title} (${mod.slug})`);
        deleted++;
      }
    }
  }

  console.log(`
   Módulos — criados: ${created} | atualizados: ${updated} | deletados: ${deleted} | ignorados: ${skipped}
`);

  return moduleMap;
}

// ─── sync challenges ─────────────────────────────────────────────────────────

async function syncChallenges(moduleMap: Map<string, string>): Promise<void> {
  const dataSourceId = process.env.NOTION_CHALLENGES_DB_ID!;
  console.log("⚔️  Sincronizando desafios...\n");

  const rows = await queryAllRows(dataSourceId);
  console.log(`   ${rows.length} desafio(s) encontrado(s) no Notion`);

  let created = 0, updated = 0, skipped = 0, deleted = 0;

  // Track synced challenge ids to detect deletions
  const syncedChallengeIds = new Set<string>();

  for (const row of rows) {
    const page = row as {
      id: string;
      properties: {
        Title: { title: Array<{ plain_text: string }> };
        Module: { relation: Array<{ id: string }> };
        Difficulty: { select: { name: string } | null };
        Points: { number: number | null };
        Order: { number: number | null };
      };
    };

    const title = titleText(page.properties.Title);
    const notionModulePageId = page.properties.Module.relation[0]?.id ?? "";
    const difficulty = page.properties.Difficulty.select?.name ?? "beginner";
    const points = page.properties.Points.number ?? 10;
    const order = page.properties.Order.number ?? 0;

    if (!title) {
      console.warn(`   ⚠️  Sem Title — ignorado (id: ${page.id})`);
      skipped++;
      continue;
    }

    if (!notionModulePageId) {
      console.warn(`   ⚠️  Sem Module — ignorado: "${title}"`);
      skipped++;
      continue;
    }

    // Resolve Notion page id → DB module id
    let moduleId = moduleMap.get(notionModulePageId);

    // Fallback: look up from DB directly in case module was synced previously
    if (!moduleId) {
      const mod = await prisma.module.findFirst({
        where: { id: notionModulePageId },
      });
      if (mod) moduleId = mod.id;
    }

    if (!moduleId) {
      console.warn(`   ⚠️  Módulo não encontrado para "${title}" (notion page: ${notionModulePageId})`);
      skipped++;
      continue;
    }

    // Parse page body
    const markdown = await fetchPageMarkdown(page.id);
    const parsed = parseChallengePage(markdown);

    if (!parsed) {
      console.warn(`   ⚠️  Corpo inválido — ignorado: "${title}" (esperado ## Description, ## Starter Code, ## Tests)`);
      skipped++;
      continue;
    }

    const { description, starterCode, tests } = parsed;

    // Upsert by title + moduleId
    const existing = await prisma.challenge.findFirst({
      where: { title, moduleId },
    });

    if (existing) {
      await prisma.challenge.update({
        where: { id: existing.id },
        data: { description, difficulty, points, order, starterCode, tests },
      });
      console.log(`   ✏️  Atualizado: [${String(order).padStart(2, "0")}] ${title} (${difficulty})`);
      syncedChallengeIds.add(existing.id);
      updated++;
    } else {
      const created_ = await prisma.challenge.create({
        data: { title, description, difficulty, points, order, starterCode, tests, moduleId },
      });
      console.log(`   ✅  Criado:    [${String(order).padStart(2, "0")}] ${title} (${difficulty})`);
      syncedChallengeIds.add(created_.id);
      created++;
    }
  }

  // Delete challenges that no longer exist in Notion
  // Only for modules that were synced (avoid deleting challenges from non-notion modules)
  if (syncedChallengeIds.size > 0 || moduleMap.size > 0) {
    const syncedModuleDbIds = [...moduleMap.values()];
    if (syncedModuleDbIds.length > 0) {
      const allChallenges = await prisma.challenge.findMany({
        where: { moduleId: { in: syncedModuleDbIds } },
        select: { id: true, title: true },
      });
      for (const challenge of allChallenges) {
        if (!syncedChallengeIds.has(challenge.id)) {
          await prisma.submission.deleteMany({ where: { challengeId: challenge.id } });
          await prisma.challenge.delete({ where: { id: challenge.id } });
          console.log(`   🗑️  Deletado:  ${challenge.title}`);
          deleted++;
        }
      }
    }
  }

  console.log(`
   Desafios — criados: ${created} | atualizados: ${updated} | deletados: ${deleted} | ignorados: ${skipped}
`);
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔄 Iniciando sync com o Notion...\n");

  if (!process.env.NOTION_TOKEN) throw new Error("NOTION_TOKEN não definido no .env");
  if (!process.env.NOTION_MODULES_DB_ID) throw new Error("NOTION_MODULES_DB_ID não definido no .env");
  if (!process.env.NOTION_CHALLENGES_DB_ID) throw new Error("NOTION_CHALLENGES_DB_ID não definido no .env");

  const moduleMap = await syncModules();
  await syncChallenges(moduleMap);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Sync concluído!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((err) => {
    console.error("❌ Erro no sync:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
