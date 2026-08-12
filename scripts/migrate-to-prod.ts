/**
 * migrate-to-prod.ts
 *
 * Copia módulos e desafios do banco local (SQLite) para o banco de prod (Turso).
 * É idempotente: upsert por slug (módulos) e por title+moduleId (desafios).
 *
 * Uso:
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npx tsx scripts/migrate-to-prod.ts
 */

import "dotenv/config";
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import path from "path";

// ─── Local DB ────────────────────────────────────────────────────────────────

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const dbPath = dbUrl.startsWith("file:") ? dbUrl.slice(5) : dbUrl;
const localDb = new Database(path.resolve(process.cwd(), dbPath), { readonly: true });

// ─── Prod DB (Turso) ─────────────────────────────────────────────────────────

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  console.error("❌ TURSO_DATABASE_URL e TURSO_AUTH_TOKEN são obrigatórios.");
  process.exit(1);
}

const prod = createClient({ url: tursoUrl, authToken: tursoToken });

// ─── Types ───────────────────────────────────────────────────────────────────

interface LocalModule {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  order: number;
  icon: string;
  createdAt: string;
}

interface LocalChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  tests: string;
  starterCode: string;
  moduleId: string | null;
  order: number;
  createdAt: string;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Migrando dados para o banco de produção (Turso)...\n");

  // ── Modules ──────────────────────────────────────────────────────────────

  const modules = localDb.prepare("SELECT * FROM Module ORDER BY `order`").all() as LocalModule[];
  console.log(`📚 ${modules.length} módulo(s) encontrado(s) localmente\n`);

  // Mapa: id local → id prod (pode ser o mesmo se upsert mantiver)
  const moduleIdMap = new Map<string, string>();

  let modCreated = 0, modUpdated = 0;

  for (const mod of modules) {
    // Verifica se já existe por slug
    const existing = await prod.execute({
      sql: `SELECT id FROM Module WHERE slug = ?`,
      args: [mod.slug],
    });

    if (existing.rows.length > 0) {
      const prodId = existing.rows[0].id as string;
      await prod.execute({
        sql: `UPDATE Module SET title=?, description=?, content=?, \`order\`=?, icon=? WHERE slug=?`,
        args: [mod.title, mod.description, mod.content, mod.order, mod.icon, mod.slug],
      });
      moduleIdMap.set(mod.id, prodId);
      console.log(`   ✏️  Atualizado: ${mod.title}`);
      modUpdated++;
    } else {
      await prod.execute({
        sql: `INSERT INTO Module (id, slug, title, description, content, \`order\`, icon, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [mod.id, mod.slug, mod.title, mod.description, mod.content, mod.order, mod.icon, mod.createdAt],
      });
      moduleIdMap.set(mod.id, mod.id);
      console.log(`   ✅ Criado:    ${mod.title}`);
      modCreated++;
    }
  }

  console.log(`\n   Módulos — criados: ${modCreated} | atualizados: ${modUpdated}\n`);

  // ── Challenges ───────────────────────────────────────────────────────────

  const challenges = localDb
    .prepare("SELECT * FROM Challenge ORDER BY moduleId, `order`")
    .all() as LocalChallenge[];

  console.log(`⚔️  ${challenges.length} desafio(s) encontrado(s) localmente\n`);

  let chalCreated = 0, chalUpdated = 0;

  for (const ch of challenges) {
    const prodModuleId = ch.moduleId ? (moduleIdMap.get(ch.moduleId) ?? ch.moduleId) : null;

    // Verifica se já existe por title + moduleId
    const existing = await prod.execute({
      sql: `SELECT id FROM Challenge WHERE title = ? AND moduleId ${prodModuleId ? "= ?" : "IS NULL"}`,
      args: prodModuleId ? [ch.title, prodModuleId] : [ch.title],
    });

    if (existing.rows.length > 0) {
      await prod.execute({
        sql: `UPDATE Challenge
              SET description=?, difficulty=?, points=?, tests=?, starterCode=?, \`order\`=?, moduleId=?
              WHERE title=? AND moduleId ${prodModuleId ? "= ?" : "IS NULL"}`,
        args: prodModuleId
          ? [ch.description, ch.difficulty, ch.points, ch.tests, ch.starterCode, ch.order, prodModuleId, ch.title, prodModuleId]
          : [ch.description, ch.difficulty, ch.points, ch.tests, ch.starterCode, ch.order, null, ch.title],
      });
      console.log(`   ✏️  Atualizado: [${String(ch.order).padStart(2, "0")}] ${ch.title}`);
      chalUpdated++;
    } else {
      await prod.execute({
        sql: `INSERT INTO Challenge (id, title, description, difficulty, points, tests, starterCode, moduleId, \`order\`, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [ch.id, ch.title, ch.description, ch.difficulty, ch.points, ch.tests, ch.starterCode, prodModuleId, ch.order, ch.createdAt],
      });
      console.log(`   ✅ Criado:    [${String(ch.order).padStart(2, "0")}] ${ch.title}`);
      chalCreated++;
    }
  }

  console.log(`\n   Desafios — criados: ${chalCreated} | atualizados: ${chalUpdated}`);

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Migração concluída!
━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  localDb.close();
  prod.close();
}

main().catch((err) => {
  console.error("❌ Erro:", err.message ?? err);
  process.exit(1);
});
