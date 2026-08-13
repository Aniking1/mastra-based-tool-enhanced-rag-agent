import "dotenv/config";

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const modelName = process.env.MODEL_NAME;

if (!openRouterApiKey) {
  throw new Error(
    "OPENROUTER_API_KEY is not configured. Add it to your .env file.",
  );
}

if (!modelName) {
  throw new Error(
    "MODEL_NAME is not configured. Add it to your .env file.",
  );
}

export const OPENROUTER_API_KEY: string = openRouterApiKey;
export const MODEL_NAME: string = modelName;