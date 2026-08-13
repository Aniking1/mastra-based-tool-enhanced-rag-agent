import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  OPENROUTER_API_KEY,
  MODEL_NAME,
} from "./config";

export const openrouter = createOpenAICompatible({
  name: "openrouter",
  apiKey: OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export const model = openrouter.chatModel(MODEL_NAME);