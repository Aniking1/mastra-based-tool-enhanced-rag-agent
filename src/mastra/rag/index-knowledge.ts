import { LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";
import { loadKnowledgeDocuments } from "./knowledge-base";

const VECTOR_DB_URL = "file:./knowledge.db";
const INDEX_NAME = "knowledge_base";

async function indexKnowledgeBase() {
  console.log("Loading knowledge documents...");

  const documents = await loadKnowledgeDocuments();

  console.log(`Loaded ${documents.length} documents.`);

  // --------------------------------------------------
  // Chunk the documents
  // --------------------------------------------------

  const chunks = [];

  for (const document of documents) {
    const documentChunks = await document.chunk({
      strategy: "recursive",
    });

    chunks.push(...documentChunks);
  }

  console.log(`Created ${chunks.length} chunks.`);

  if (chunks.length === 0) {
    throw new Error("No document chunks were created.");
  }

  // --------------------------------------------------
  // Generate embeddings
  // --------------------------------------------------

  console.log("Generating embeddings...");

  const embeddingResult = await fastembed.doEmbed({
    values: chunks.map((chunk) => chunk.text),
  });

  const embeddings = embeddingResult.embeddings;

  console.log(`Generated ${embeddings.length} embeddings.`);

  if (embeddings.length === 0) {
    throw new Error("No embeddings were generated.");
  }

  // --------------------------------------------------
  // Create vector store
  // --------------------------------------------------

  const vectorStore = new LibSQLVector({
    id: "knowledge-vector-store",
    url: VECTOR_DB_URL,
  });

  // --------------------------------------------------
  // Recreate vector index
  // --------------------------------------------------

  const indexes = await vectorStore.listIndexes();

  const indexExists = indexes.some(
    (index) => index === INDEX_NAME,
  );

  if (indexExists) {
    console.log("Deleting existing vector index...");

    await vectorStore.deleteIndex({
      indexName: INDEX_NAME,
    });
  }

  console.log("Creating vector index...");

  await vectorStore.createIndex({
    indexName: INDEX_NAME,
    dimension: embeddings[0].length,
    metric: "cosine",
  });

  // --------------------------------------------------
  // Store vectors
  // --------------------------------------------------

  console.log("Storing vectors...");

  await vectorStore.upsert({
    indexName: INDEX_NAME,
    vectors: embeddings,
    metadata: chunks.map((chunk) => ({
      text: chunk.text,
      ...chunk.metadata,
    })),
  });

  console.log("Knowledge base indexed successfully.");
}

indexKnowledgeBase().catch((error) => {
  console.error("Knowledge-base indexing failed:", error);
  process.exit(1);
});