# Mastra-Based Tool-Enhanced RAG Travel Agent

A tool-enhanced AI travel assistant built with Mastra, TypeScript, OpenRouter, FastEmbed, and a local LibSQL/SQLite vector database.

## Features

- AI-powered travel assistant
- Retrieval-Augmented Generation (RAG)
- Internal company and travel policy retrieval
- Flight booking tool
- Hotel booking tool
- Currency conversion tool
- Conversation memory
- Mastra Studio
- Command-line interface (CLI)

## Technology Stack

- TypeScript
- Node.js
- Mastra
- OpenRouter
- NVIDIA Nemotron model
- FastEmbed
- Mastra RAG
- Mastra Memory
- LibSQL
- SQLite
- Zod
- tsx

## Project Structure

    mastra-based-tool-enhanced-rag-agent/
    ├── data/
    │   ├── company_policy.txt
    │   ├── conference_guidelines.txt
    │   └── travel_policy.txt
    ├── src/
    │   ├── cli.ts
    │   └── mastra/
    │       ├── agents/
    │       │   └── agent.ts
    │       ├── rag/
    │       │   ├── index-knowledge.ts
    │       │   └── search-knowledge.ts
    │       ├── tools/
    │       │   ├── rag-tool.ts
    │       │   └── travel-tools.ts
    │       ├── config.ts
    │       ├── index.ts
    │       └── model.ts
    ├── .env.example
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    ├── README.md
    └── tsconfig.json

## Installation

### 1. Clone the repository

    git clone https://github.com/Aniking1/mastra-based-tool-enhanced-rag-agent.git

### 2. Enter the project

    cd mastra-based-tool-enhanced-rag-agent

### 3. Install dependencies

    npm install

The project includes `tsx` as a development dependency.

Verify it with:

    npm list tsx

## Environment Configuration

Create `.env` from `.env.example`.

PowerShell:

    Copy-Item .env.example .env

Configure the following values:

    OPENROUTER_API_KEY=your_openrouter_api_key_here
    MODEL_NAME=nvidia/nemotron-3-nano-30b-a3b:free
    KNOWLEDGE_DB_PATH=./knowledge.db

Never commit the real API key to GitHub.

## RAG Knowledge Base

The RAG system uses three internal documents:

- `company_policy.txt`
- `travel_policy.txt`
- `conference_guidelines.txt`

These documents are stored in the `data/` directory.

The indexing pipeline:

1. Loads the documents.
2. Creates document chunks.
3. Generates embeddings with FastEmbed.
4. Creates the `knowledge_base` vector index.
5. Stores the vectors in `knowledge.db`.

The generated `knowledge.db` file is not committed to Git, so a fresh clone must initialize the RAG database.

## IMPORTANT: Initialize RAG After Cloning

Run:

    npm run setup:rag

This runs the RAG indexing process.

A successful run ends with:

    Knowledge base indexed successfully.

The underlying indexing command is also available:

    npm run rag:index

## Test the RAG Tool

Run:

    npm run rag:test -- "What is the company's policy on hotel accommodation?"

The command should retrieve information from the internal knowledge base, including results from the company, travel, and conference documents.

The expected policy information includes:

- Employees travelling on official assignments are entitled to hotel accommodation.
- Hotels should be booked at the approved corporate rate.
- Hotel accommodation should not exceed the approved nightly rate.
- Employees are eligible for reimbursement after submitting receipts.

The documents do not specify a separate hotel pre-approval procedure.

## Run the Application

Start the Mastra development server:

    npm run dev

Open Mastra Studio:

    http://localhost:4111

Select the `Travel Assistant` agent.

## CLI

Run:

    npm run cli

The CLI supports the following tests.

### RAG / Internal Policy

    What is the company's policy on hotel accommodation?

### Hotel Tool

    Give me hotel booking information for Abuja for 3 nights.

### Flight Tool

    What flight booking information do you have for Lagos to Abuja?

### Currency Tool

    Convert 100 USD to NGN.

### Help

    /help

### Exit

    /exit

## Tools

### query_internal_knowledge

Searches the internal knowledge base for travel, conference, hotel, flight, reimbursement, and company policy information.

For internal policy questions, the agent is instructed to use this tool as the primary source of truth.

### get_flight_booking

Returns flight booking information between two cities.

### get_hotel_booking

Returns hotel booking information based on city and number of nights.

### convert_currency

Converts between supported currencies.

## RAG Architecture

The indexing flow is:

    data/*.txt
        ↓
    Load documents
        ↓
    Create chunks
        ↓
    Generate embeddings
        ↓
    FastEmbed
        ↓
    LibSQLVector
        ↓
    knowledge.db
        ↓
    knowledge_base

The query flow is:

    User question
        ↓
    query_internal_knowledge
        ↓
    Query embedding
        ↓
    knowledge_base search
        ↓
    Relevant documents
        ↓
    Agent
        ↓
    Grounded response

## Policy Grounding

The agent is instructed to:

- Use `query_internal_knowledge` for internal policy questions.
- Treat retrieved internal knowledge as the primary source of truth.
- Only state requirements supported by the retrieved documents.
- Avoid inventing policies.
- Avoid unsupported assumptions.
- Avoid generalizing requirements from one policy category to another.
- State clearly when the documents do not specify something.

For example, the documents explicitly state that flights require approval before booking. They do not state that hotel bookings require a separate pre-approval process.

## Memory

The agent uses Mastra Memory with local LibSQL storage.

Memory configuration includes:

- Local memory storage
- Vector memory storage
- FastEmbed embeddings
- Semantic recall
- Thread-based context

## Validation

Run TypeScript validation:

    npx tsc --noEmit

A successful command returns to the PowerShell prompt without TypeScript errors.

## Production Build

Run:

    npx mastra build

A successful build reports:

    Build successful, you can now deploy the .mastra/output directory to your target platform.

## Troubleshooting

### RAG error: no such table: knowledge_base

If the RAG tool reports:

    SQLITE_ERROR: no such table: knowledge_base

initialize the local vector database:

    npm run setup:rag

Then verify:

    npm run rag:test -- "What is the company's policy on hotel accommodation?"

After successful retrieval, restart Mastra:

    npm run dev

### tsx not found

Run:

    npm install

Then:

    npm list tsx

The project declares `tsx` as a development dependency.

### OpenRouter authentication error

Check `.env` and ensure:

    OPENROUTER_API_KEY=your_openrouter_api_key_here

and:

    MODEL_NAME=nvidia/nemotron-3-nano-30b-a3b:free

## Fresh-Clone Testing Procedure

A tutor or evaluator cloning the repository should use this order:

1. Clone the repository.
2. Run `npm install`.
3. Configure `.env`.
4. Run `npm run setup:rag`.
5. Run `npm run rag:test -- "What is the company's policy on hotel accommodation?"`.
6. Run `npm run dev`.
7. Open `http://localhost:4111`.
8. Select `Travel Assistant`.
9. Test the RAG question.
10. Test the flight, hotel, and currency tools.

The RAG initialization step is essential because `knowledge.db` is a generated local database and is not stored in Git.

## Development Commands

    npm run dev
    npm run build
    npm run start
    npm run cli
    npm run setup:rag
    npm run rag:index
    npm run rag:test -- "What is the company's policy on hotel accommodation?"
    npx tsc --noEmit
    npx mastra build

## Repository

GitHub repository:

https://github.com/Aniking1/mastra-based-tool-enhanced-rag-agent.git

## Project Status

The project includes:

- Tool-enhanced AI agent
- Internal RAG retrieval
- Local vector database
- Flight booking tool
- Hotel booking tool
- Currency conversion
- Conversation memory
- CLI
- Mastra Studio
- Policy-grounding safeguards
- RAG initialization workflow
- TypeScript validation
- Production build configuration