import { LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";

const VECTOR_DB_URL = "file:./knowledge.db";
const INDEX_NAME = "knowledge_base";

async function searchKnowledge(query: string) {
  console.log(`\nSearching knowledge base for: "${query}"\n`);

  const vectorStore = new LibSQLVector({
    id: "knowledge-vector-store",
    url: VECTOR_DB_URL,
  });

  // Generate an embedding for the user's question.
  const embeddingResult = await fastembed.doEmbed({
    values: [query],
  });

  const queryVector = embeddingResult.embeddings[0];

  // Search the vector database.
  const results = await vectorStore.query({
    indexName: INDEX_NAME,
    queryVector,
    topK: 4,
  });

  console.log("Retrieved results:");
  console.log("=".repeat(60));

  console.dir(results, { depth: null });
}

const query =
  process.argv.slice(2).join(" ") ||
  "What is the company's policy on hotel accommodation?";

searchKnowledge(query).catch((error) => {
  console.error("Knowledge search failed:", error);
  process.exit(1);
});