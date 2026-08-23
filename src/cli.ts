import "dotenv/config";

import readline from "node:readline";
import { randomUUID } from "node:crypto";

import { LibSQLVector } from "@mastra/libsql";

import { agent } from "./mastra/agents/agent";
import { indexKnowledgeBase } from "./mastra/rag/index-knowledge";

const resourceId = "travel-assistant-cli";
const threadId = `travel-cli-${randomUUID()}`;

const VECTOR_DB_URL = "file:./knowledge.db";
const INDEX_NAME = "knowledge_base";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

function askQuestion(): Promise<string> {
  return new Promise((resolve) => {
    rl.question("\nYou: ", resolve);
  });
}

async function ensureKnowledgeBase() {
  const vectorStore = new LibSQLVector({
    id: "knowledge-vector-store",
    url: VECTOR_DB_URL,
  });

  const indexes = await vectorStore.listIndexes();

  const indexExists = indexes.some(
    (index) => index === INDEX_NAME,
  );

  if (indexExists) {
    return;
  }

  console.log("\nKnowledge base is not initialized.");
  console.log("Performing first-time RAG setup...\n");

  await indexKnowledgeBase();

  console.log("\nFirst-time RAG setup completed.\n");
}

async function runAgent(userMessage: string) {
  try {
    const stream = await agent.stream(userMessage, {
      memory: {
        resource: resourceId,
        thread: threadId,
      },
    });

    process.stdout.write("\nAssistant: ");

    for await (const chunk of stream.textStream) {
      process.stdout.write(chunk);
    }

    process.stdout.write("\n");
  } catch (error) {
    console.error("\n\nAgent error:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}

async function main() {
  try {
    await ensureKnowledgeBase();
  } catch (error) {
    console.error("\nRAG initialization failed:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exit(1);
  }

  console.log("========================================");
  console.log("       Travel Assistant CLI");
  console.log("========================================");
  console.log("Type /exit to quit.");
  console.log("Type /help for available commands.");

  while (true) {
    const userMessage = await askQuestion();
    const input = userMessage.trim();

    if (!input) {
      continue;
    }

    if (input.toLowerCase() === "/exit") {
      console.log("\nGoodbye!");
      rl.close();
      break;
    }

    if (input.toLowerCase() === "/help") {
      console.log(`
Available commands:

/help  - Show this help message
/exit  - Exit the application
`);
      continue;
    }

    await runAgent(input);
  }
}

process.on("SIGINT", () => {
  console.log("\n\nGoodbye!");
  rl.close();
  process.exit(0);
});

main().catch((error) => {
  console.error("\nFatal error:", error);
  rl.close();
  process.exit(1);
});