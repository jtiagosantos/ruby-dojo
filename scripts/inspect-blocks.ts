import "dotenv/config";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function main() {
  const pageId = "3b95261347dc8099accac03f3ec714bd";
  const blocks: unknown[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.blocks.children.list({ block_id: pageId, start_cursor: cursor, page_size: 100 });
    blocks.push(...res.results);
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  console.log(`Total: ${blocks.length} blocos\n`);
  for (const block of blocks) {
    const b = block as Record<string, unknown>;
    const type = b.type as string;
    const content = b[type] as Record<string, unknown>;
    const richText = (content?.rich_text as Array<{ plain_text: string }> | undefined)
      ?.map(t => t.plain_text).join("").substring(0, 100) ?? "";
    const language = (content?.language as string | undefined) ?? "";
    console.log(`[${type}]${language ? `(${language})` : ""} ${richText}`);
  }
}

main().catch(console.error);
