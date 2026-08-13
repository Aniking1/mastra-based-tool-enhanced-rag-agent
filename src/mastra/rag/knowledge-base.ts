import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { MDocument } from "@mastra/rag";

const DATA_DIR = join(process.cwd(), "data");

export const KNOWLEDGE_FILES = [
  "company_policy.txt",
  "travel_policy.txt",
  "conference_guidelines.txt",
] as const;

export async function loadKnowledgeDocuments() {
  const documents = [];

  for (const filename of KNOWLEDGE_FILES) {
    const filePath = join(DATA_DIR, filename);
    const text = await readFile(filePath, "utf-8");

    documents.push(
      new MDocument({
        type: "text",
        docs: [
          {
            text,
            metadata: {
              source: filename,
            },
          },
        ],
      }),
    );
  }

  return documents;
}