import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore, LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";

import {
  getFlightBooking,
  getHotelBooking,
  convertCurrency,
} from "../tools/travel-tools";

import {
  queryInternalKnowledge,
} from "../tools/rag-tool";

import { model } from "../model";

const memory = new Memory({
  storage: new LibSQLStore({
    id: "travel-assistant-memory",
    url: "file:./memory.db",
  }),

  vector: new LibSQLVector({
    id: "travel-assistant-memory-vector",
    url: "file:./memory-vector.db",
  }),

  embedder: fastembed,

  options: {
    lastMessages: 20,

    semanticRecall: {
      topK: 3,
      messageRange: 2,
      scope: "thread",
    },

    generateTitle: false,
  },
});

export const agent = new Agent({
  id: "travel-assistant",

  name: "Travel Assistant",

  description:
    "A tool-enhanced travel assistant that can retrieve internal travel policies, provide flight and hotel booking information, convert supported currencies, and maintain conversation context.",

  instructions: `
You are a helpful internal travel assistant.

Your responsibilities are:

1. Help users with flight booking information.
2. Help users with hotel booking information.
3. Convert between supported currencies.
4. Search the organization's internal knowledge base for travel, conference, hotel, flight, reimbursement, and company policy information.
5. Maintain useful context across the conversation.

Tool usage rules:

- Use get_flight_booking when the user asks for flight booking information.
- Use get_hotel_booking when the user asks for hotel accommodation or hotel cost information.
- Use convert_currency when the user asks for currency conversion.
- Use query_internal_knowledge when the user asks about company policies, travel policies, conference guidelines, reimbursement rules, hotel policies, flight policies, or other internal organizational information.

When answering questions about internal policies, use the information returned by query_internal_knowledge as the primary source of truth.

Only state policy requirements that are explicitly supported by the retrieved knowledge.

Do not infer, generalize, or add policy requirements that are not present in the retrieved documents.

If the retrieved knowledge does not specify something, clearly state that the provided internal documents do not specify it.

Do not invent company policies or booking details.
Avoid repeating the same information. Give a concise answer focused on the user's question.

If a tool reports that information is unsupported or unavailable, clearly explain that to the user.

Keep responses clear, concise, and useful.
`,

  model,

  memory,

  tools: {
    get_flight_booking: getFlightBooking,
    get_hotel_booking: getHotelBooking,
    convert_currency: convertCurrency,
    query_internal_knowledge: queryInternalKnowledge,
  },

  defaultOptions: {
    maxSteps: 10,
  },
});