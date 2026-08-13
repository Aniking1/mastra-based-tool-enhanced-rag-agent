import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";

import { agent } from "./agents/agent";

export const mastra = new Mastra({
  agents: {
    agent,
  },

  storage: new LibSQLStore({
    id: "travel-assistant-storage",
    url: "file:./mastra.db",
  }),
});