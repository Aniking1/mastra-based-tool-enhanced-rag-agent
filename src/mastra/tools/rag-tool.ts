import "dotenv/config";

import { LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const VECTOR_DB_URL = process.env.KNOWLEDGE_DB_PATH
  ? `file:${process.env.KNOWLEDGE_DB_PATH.replace(/\\/g, "/")}`
  : "file:./knowledge.db";

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