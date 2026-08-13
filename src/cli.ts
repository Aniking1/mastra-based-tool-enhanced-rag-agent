import "dotenv/config";

import readline from "node:readline";
import { randomUUID } from "node:crypto";

import { agent } from "./mastra/agents/agent";

const resourceId = "travel-assistant-cli";
const threadId = `travel-cli-${randomUUID()}`;

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