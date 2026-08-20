import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "../../..");

const configuredPath =
  process.env.KNOWLEDGE_DB_PATH || "./knowledge.db";

const knowledgeDbPath = path.isAbsolute(configuredPath)
  ? configuredPath
  : path.resolve(projectRoot, configuredPath);

const VECTOR_DB_URL = `file:${knowledgeDbPath}`;

const INDEX_NAME = "knowledge_base";

export const queryInternalKnowledge = createTool({
  id: "query_internal_knowledge",

  description:
    "Search the internal company knowledge base for relevant travel, conference, hotel, flight, reimbursement, and company policy information.",

  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .describe(
        "The question to search for in the internal knowledge base.",
      ),
  }),

  execute: async ({ query }) => {
    //console.log("[RAG DEBUG] CWD:", process.cwd());
    //console.log("[RAG DEBUG] DB path:", knowledgeDbPath);
    //console.log("[RAG DEBUG] DB URL:", VECTOR_DB_URL);

    const vectorStore = new LibSQLVector({
      id: "knowledge-vector-store",
      url: VECTOR_DB_URL,
    });

    const embeddingResult = await fastembed.doEmbed({
      values: [query],
    });

    const queryVector = embeddingResult.embeddings[0];

    if (!queryVector) {
      return "Unable to generate an embedding for the query.";
    }

    const results = await vectorStore.query({
      indexName: INDEX_NAME,
      queryVector,
      topK: 4,
    });

    if (!results || results.length === 0) {
      return "No relevant internal knowledge found.";
    }

    const knowledge = results
      .map((result) => {
        const source =
          result.metadata?.source ?? "Unknown source";

        const text =
          result.metadata?.text ?? "";

        return `[${source}]\n${text}`;
      })
      .join("\n\n");

    return `Knowledge Base
==============

${knowledge}`;
  },
});