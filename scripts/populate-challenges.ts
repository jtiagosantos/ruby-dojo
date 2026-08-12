import "dotenv/config";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// ─── Config ────────────────────────────────────────────────────────────────

const CHALLENGES_DB_ID = "3b95261347dc80718d5cd877c15ea6cf";
const CHALLENGES_DATA_SOURCE_ID = "4d552613-47dc-8323-aa95-07fdccc35bee";
const SOURCE_PAGE_ID = "3b95261347dc8099accac03f3ec714bd"; // página com os desafios a importar
const MODULE_NOTION_PAGE_ID = "3ba52613-47dc-8093-ba7e-cd6d4a1a7787";
const MODULE_NAME = "Collections + Enumerable";
const DEFAULT_DIFFICULTY = "beginner";
const DEFAULT_POINTS = 10;

// ─── Types ──────────────────────────────────────────────────────────────────

// Each item in the description preserves the original block type and content
type DescriptionItem =
  | { kind: "text";         content: string }
  | { kind: "bulleted";     content: string }
  | { kind: "code";         content: string; language: string }
  | { kind: "examples_h3"                                     }  // ### Exemplos heading marker
  | { kind: "examples_code"; content: string; language: string };

interface Challenge {
  title: string;
  descriptionItems: DescriptionItem[];
  starterCode: string;
  tests: string;
}

// ─── Parse the source page blocks ───────────────────────────────────────────

type NotionBlock = {
  id: string;
  type: string;
  heading_1?: { rich_text: Array<{ plain_text: string }> };
  heading_2?: { rich_text: Array<{ plain_text: string }> };
  heading_3?: { rich_text: Array<{ plain_text: string }> };
  paragraph?: { rich_text: Array<{ plain_text: string }> };
  code?: { rich_text: Array<{ plain_text: string }>; language: string };
  bulleted_list_item?: { rich_text: Array<{ plain_text: string }> };
  numbered_list_item?: { rich_text: Array<{ plain_text: string }> };
  quote?: { rich_text: Array<{ plain_text: string }> };
  divider?: object;
};

function extractText(block: NotionBlock): string {
  const richTexts =
    block.heading_1?.rich_text ??
    block.heading_2?.rich_text ??
    block.heading_3?.rich_text ??
    block.paragraph?.rich_text ??
    block.code?.rich_text ??
    block.bulleted_list_item?.rich_text ??
    block.numbered_list_item?.rich_text ??
    block.quote?.rich_text ??
    [];
  return richTexts.map((t) => t.plain_text).join("");
}

async function fetchAllBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined = undefined;
  do {
    const res = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...(res.results as NotionBlock[]));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return blocks;
}

function parseChallengesFromBlocks(blocks: NotionBlock[]): Challenge[] {
  const challenges: Challenge[] = [];
  let current: Partial<Challenge> | null = null;
  let currentSection: "description" | "starterCode" | "tests" | null = null;
  // Within description, track if we're in an examples subsection
  let inExamples = false;

  let descriptionItems: DescriptionItem[] = [];
  let starterCodeLines: string[] = [];
  let testsLines: string[] = [];

  const flushCurrent = () => {
    if (!current?.title) return;
    const starterCode = starterCodeLines.join("\n").trim();
    const tests = testsLines.join("\n").trim();
    const hasDescription = descriptionItems.length > 0;
    if (hasDescription && starterCode && tests) {
      challenges.push({
        title: current.title,
        descriptionItems: [...descriptionItems],
        starterCode,
        tests,
      });
    } else {
      console.warn(`  ⚠️  Desafio ignorado (seções incompletas): "${current.title}"`);
    }
    current = null;
    currentSection = null;
    inExamples = false;
    descriptionItems = [];
    starterCodeLines = [];
    testsLines = [];
  };

  for (const block of blocks) {
    const text = extractText(block).trim();

    // ── New kata ──────────────────────────────────────────────────────────
    // Supports two patterns:
    //   "Kata 01 — Título"  (old format)
    //   "1. Título"         (new format)
    const isKataHeading =
      block.type === "heading_1" &&
      (/^Kata \d+/i.test(text) || /^\d+[\.\)]\s+\S/.test(text));

    if (isKataHeading) {
      flushCurrent();
      const title = text
        .replace(/^Kata \d+\s*[—–-]\s*/i, "")  // strip "Kata XX — "
        .replace(/^\d+[\.\)]\s+/, "")            // strip "N. " or "N) "
        .trim();
      current = { title };
      currentSection = null;
      inExamples = false;
      continue;
    }

    // Non-challenge heading_1 (e.g. "Ordem sugerida de prática") — flush and stop collecting
    if (block.type === "heading_1") {
      flushCurrent();
      continue;
    }

    if (!current) continue;

    // ── Section headings (h2) ─────────────────────────────────────────────
    if (block.type === "heading_2") {
      const heading = text.toLowerCase();
      if (heading === "descrição" || heading === "descricao" || heading === "description") {
        currentSection = "description";
        inExamples = false;
      } else if (heading === "starter code") {
        currentSection = "starterCode";
        inExamples = false;
      } else if (heading === "testes" || heading === "tests") {
        currentSection = "tests";
        inExamples = false;
      } else {
        currentSection = null;
        inExamples = false;
      }
      continue;
    }

    // ── Subsection headings (h3) — only relevant inside description ───────
    if (block.type === "heading_3" && currentSection === "description") {
      const heading = text.toLowerCase();
      if (heading === "exemplos" || heading === "examples" || heading === "exemplo") {
        inExamples = true;
        descriptionItems.push({ kind: "examples_h3" });
      }
      continue;
    }

    if (!currentSection) continue;
    if (block.type === "divider") continue;

    // ── Code blocks ───────────────────────────────────────────────────────
    if (block.type === "code") {
      const codeContent = block.code?.rich_text.map((t) => t.plain_text).join("") ?? "";
      const language = block.code?.language ?? "plain text";
      if (currentSection === "description") {
        if (inExamples) {
          descriptionItems.push({ kind: "examples_code", content: codeContent, language });
        } else {
          // code block before ### Exemplos (e.g. format hints, struct examples)
          descriptionItems.push({ kind: "code", content: codeContent, language });
        }
      } else if (currentSection === "starterCode") {
        starterCodeLines.push(codeContent);
      } else if (currentSection === "tests") {
        testsLines.push(codeContent);
      }
      continue;
    }

    // ── Text blocks ───────────────────────────────────────────────────────
    if (currentSection === "description") {
      if (block.type === "paragraph" && text) {
        descriptionItems.push({ kind: "text", content: text });
      } else if (
        (block.type === "bulleted_list_item" || block.type === "numbered_list_item") &&
        text
      ) {
        descriptionItems.push({ kind: "bulleted", content: text });
      } else if (block.type === "quote" && text) {
        descriptionItems.push({ kind: "text", content: text });
      }
    } else if (currentSection === "starterCode") {
      if (text) starterCodeLines.push(text);
    } else if (currentSection === "tests") {
      if (text) testsLines.push(text);
    }
  }

  flushCurrent();
  return challenges;
}

// ─── Build Notion page body for a challenge ──────────────────────────────────

type NotionBlockParam =
  | { object: "block"; type: "heading_2"; heading_2: { rich_text: Array<{ type: "text"; text: { content: string } }> } }
  | { object: "block"; type: "heading_3"; heading_3: { rich_text: Array<{ type: "text"; text: { content: string } }> } }
  | { object: "block"; type: "paragraph"; paragraph: { rich_text: Array<{ type: "text"; text: { content: string } }> } }
  | { object: "block"; type: "bulleted_list_item"; bulleted_list_item: { rich_text: Array<{ type: "text"; text: { content: string } }> } }
  | { object: "block"; type: "code"; code: { rich_text: Array<{ type: "text"; text: { content: string } }>; language: string } }
  | { object: "block"; type: "divider"; divider: Record<string, never> };

function buildChallengePageBody(challenge: Challenge): NotionBlockParam[] {
  const blocks: NotionBlockParam[] = [];

  const h2 = (content: string): NotionBlockParam => ({
    object: "block",
    type: "heading_2",
    heading_2: { rich_text: [{ type: "text", text: { content } }] },
  });

  const h3 = (content: string): NotionBlockParam => ({
    object: "block",
    type: "heading_3",
    heading_3: { rich_text: [{ type: "text", text: { content } }] },
  });

  const paragraph = (content: string): NotionBlockParam => ({
    object: "block",
    type: "paragraph",
    paragraph: { rich_text: [{ type: "text", text: { content } }] },
  });

  const bulleted = (content: string): NotionBlockParam => ({
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: { rich_text: [{ type: "text", text: { content } }] },
  });

  const code = (content: string, language = "ruby"): NotionBlockParam => ({
    object: "block",
    type: "code",
    code: { rich_text: [{ type: "text", text: { content } }], language },
  });

  const divider = (): NotionBlockParam => ({
    object: "block",
    type: "divider",
    divider: {},
  });

  // ## Description
  blocks.push(h2("Description"));
  for (const item of challenge.descriptionItems) {
    if (item.kind === "text") {
      blocks.push(paragraph(item.content));
    } else if (item.kind === "bulleted") {
      blocks.push(bulleted(item.content));
    } else if (item.kind === "code") {
      blocks.push(code(item.content, item.language));
    } else if (item.kind === "examples_h3") {
      blocks.push(h3("Exemplos"));
    } else if (item.kind === "examples_code") {
      blocks.push(code(item.content, item.language));
    }
  }

  // ## Starter Code
  blocks.push(divider());
  blocks.push(h2("Starter Code"));
  blocks.push(code(challenge.starterCode));

  // ## Tests
  blocks.push(divider());
  blocks.push(h2("Tests"));
  blocks.push(code(challenge.tests));

  return blocks;
}

// ─── Fetch existing challenges (title → page id) ─────────────────────────────

async function fetchExistingChallenges(): Promise<Map<string, string>> {
  const existing = new Map<string, string>();
  let cursor: string | undefined = undefined;
  do {
    const res = await notion.dataSources.query({
      data_source_id: CHALLENGES_DATA_SOURCE_ID,
      start_cursor: cursor,
      page_size: 100,
    } as Parameters<typeof notion.dataSources.query>[0]);
    for (const row of res.results) {
      const page = row as {
        id: string;
        properties: { Title: { title: Array<{ plain_text: string }> } };
      };
      const title = page.properties.Title.title.map((t) => t.plain_text).join("").trim();
      if (title) existing.set(title, page.id);
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return existing;
}

// ─── Replace all blocks in an existing page ──────────────────────────────────

async function replacePageBlocks(pageId: string, newBlocks: NotionBlockParam[]): Promise<void> {
  // Delete all existing blocks
  let cursor: string | undefined = undefined;
  do {
    const res = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const block of res.results) {
      await notion.blocks.delete({ block_id: (block as { id: string }).id });
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  // Append new blocks
  await notion.blocks.children.append({
    block_id: pageId,
    children: newBlocks as Parameters<typeof notion.blocks.children.append>[0]["children"],
  });
}

// ─── Create a challenge page in the Notion DB ────────────────────────────────

async function createChallenge(challenge: Challenge, order: number): Promise<void> {
  const pageBody = buildChallengePageBody(challenge);

  await notion.pages.create({
    parent: { database_id: CHALLENGES_DB_ID },
    properties: {
      Title: {
        title: [{ type: "text", text: { content: challenge.title } }],
      },
      Module: {
        relation: [{ id: MODULE_NOTION_PAGE_ID }],
      },
      Difficulty: {
        select: { name: DEFAULT_DIFFICULTY },
      },
      Points: {
        number: DEFAULT_POINTS,
      },
      Order: {
        number: order,
      },
    } as Parameters<typeof notion.pages.create>[0]["properties"],
    children: pageBody as Parameters<typeof notion.pages.create>[0]["children"],
  });
}

// ─── Update existing challenge page body ─────────────────────────────────────

async function updateChallenge(pageId: string, challenge: Challenge): Promise<void> {
  const pageBody = buildChallengePageBody(challenge);
  await replacePageBlocks(pageId, pageBody);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Populando banco de desafios do Notion...\n");

  if (!process.env.NOTION_TOKEN) {
    throw new Error("NOTION_TOKEN não definido no .env");
  }

  console.log(`📦 Configuração:`);
  console.log(`   Módulo:      ${MODULE_NAME}`);
  console.log(`   Dificuldade: ${DEFAULT_DIFFICULTY}`);
  console.log(`   Pontos:      ${DEFAULT_POINTS}`);
  console.log();

  // 1. Read source page blocks
  console.log(`📄 Lendo página de origem: ${SOURCE_PAGE_ID}`);
  const blocks = await fetchAllBlocks(SOURCE_PAGE_ID);
  console.log(`   ${blocks.length} bloco(s) encontrado(s)\n`);

  // 2. Parse challenges
  const challenges = parseChallengesFromBlocks(blocks);
  console.log(`⚔️  ${challenges.length} desafio(s) parseado(s):`);
  challenges.forEach((c, i) =>
    console.log(`   [${String(i + 1).padStart(2, "0")}] ${c.title}`)
  );
  console.log();

  if (challenges.length === 0) {
    console.error("❌ Nenhum desafio encontrado. Verifique a estrutura da página.");
    process.exit(1);
  }

  // 3. Fetch existing challenges
  console.log("🔍 Verificando desafios existentes no banco...");
  const existingChallenges = await fetchExistingChallenges();
  console.log(`   ${existingChallenges.size} desafio(s) já existem no banco\n`);

  // 4. Create or update challenges
  console.log(`📝 Processando desafios...\n`);

  let created = 0;
  let updated = 0;
  let order = 1;

  for (const challenge of challenges) {
    const existingPageId = existingChallenges.get(challenge.title);

    if (existingPageId) {
      try {
        await updateChallenge(existingPageId, challenge);
        console.log(`   ✏️  Atualizado [${String(order).padStart(2, "0")}]: "${challenge.title}"`);
        updated++;
      } catch (e: unknown) {
        const err = e as { code?: string; message?: string };
        console.error(`   ❌ Erro ao atualizar "${challenge.title}": ${err.message ?? String(e)}`);
      }
    } else {
      try {
        await createChallenge(challenge, order);
        console.log(`   ✅ Criado   [${String(order).padStart(2, "0")}]: "${challenge.title}"`);
        created++;
      } catch (e: unknown) {
        const err = e as { code?: string; message?: string };
        if (err.code === "restricted_resource") {
          console.error(`   ❌ Erro de permissão ao criar "${challenge.title}".`);
          console.error(`      A integração Notion precisa de permissão "Insert content".`);
          console.error(`      Acesse https://www.notion.so/profile/integrations, selecione a integração`);
          console.error(`      "Ruby Dojo" e habilite "Insert content" e "Update content".`);
          process.exit(1);
        }
        console.error(`   ❌ Erro ao criar "${challenge.title}": ${err.message ?? String(e)}`);
      }
    }
    order++;
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Concluído!
  Criados:    ${created}
  Atualizados: ${updated}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main().catch((err) => {
  console.error("❌ Erro fatal:", err.message ?? err);
  process.exit(1);
});
