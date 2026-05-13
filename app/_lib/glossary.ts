// English AI glossary for /en/ordliste.
// Each entry is written as a Q&A pair so definitions can be picked up
// as FAQPage / DefinedTerm by AI search engines. Definitions are
// intentionally short and citable.

import type { GlossaryTerm } from "./ordliste";

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "ai-agent",
    term: "AI agent",
    question: "What is an AI agent?",
    definition:
      "An AI agent is a program that takes a task, plans the steps it needs, calls tools (email, spreadsheets, APIs) to execute them, and delivers a result — without a person directing each action.",
    detail:
      "In practice, an AI agent consists of three things: a large language model that makes decisions, a set of tools it can call, and a loop that lets it work across multiple steps. It differs from a chatbot in that it actually does something — not just responds."
  },
  {
    slug: "agent-based-system",
    term: "Agent-based system",
    question: "What is an agent-based system?",
    definition:
      "An agent-based system is a collection of specialised AI agents that collaborate on a job. One agent can fetch data, another analyses, a third writes the response — instead of one general agent doing everything."
  },
  {
    slug: "ai-workflow",
    term: "AI workflow",
    question: "What is an AI workflow?",
    definition:
      "An AI workflow is a chain of steps where AI handles each step automatically — for example: receive email → classify → extract data → create task in CRM → send confirmation. A human only approves exceptions."
  },
  {
    slug: "agentic-ai",
    term: "Agentic AI",
    question: "What does 'agentic AI' mean?",
    definition:
      "Agentic AI means AI that acts on its own behalf instead of just answering questions. The difference is active vs. passive: a chatbot waits for you to ask; agentic AI executes tasks in the background."
  },
  {
    slug: "multi-agent",
    term: "Multi-agent system",
    question: "What is a multi-agent system?",
    definition:
      "Multiple AI agents with different specialties that coordinate to solve a task together. Used when one task is too large or too varied for a single agent to handle well."
  },
  {
    slug: "autonomous-agent",
    term: "Autonomous agent",
    question: "What is an autonomous agent?",
    definition:
      "An agent that makes decisions without human approval at each step. Autonomy is usually bounded by rules (can only use these tools) and approval gates (requires confirmation before sending money or emails outside the company)."
  },
  {
    slug: "tool-use",
    term: "Tool use",
    question: "What does tool use mean for an AI agent?",
    definition:
      "Tool use is the ability an agent has to call external functions — search the web, read from a database, send email, create an invoice. It is the difference between an agent that can think and one that can act."
  },
  {
    slug: "function-calling",
    term: "Function calling",
    question: "What is function calling in AI?",
    definition:
      "A way to let the language model choose and call a specific function with the correct arguments. It is the mechanism that makes tool use possible in practice. OpenAI, Anthropic, and others offer this as a built-in API."
  },
  {
    slug: "agent-orchestration",
    term: "Agent orchestration",
    question: "What is agent orchestration?",
    definition:
      "The logic that controls which agent does what, in what order, and how results flow between them. Think conductor — orchestration is not an agent itself, but the rules that coordinate them."
  },
  {
    slug: "llm",
    term: "Large language model (LLM)",
    question: "What is an LLM?",
    definition:
      "A large language model is a machine-learning model trained on vast amounts of text. It can write, summarise, classify, and reason in natural language. Examples: GPT-5, Claude 4.7, Gemini 2.5."
  },
  {
    slug: "rag",
    term: "RAG (Retrieval-Augmented Generation)",
    question: "What is RAG?",
    definition:
      "RAG is a pattern where the AI retrieves relevant information from your own documents or database before responding. Used when you want the agent to know your company, not just what it was trained on."
  },
  {
    slug: "prompt",
    term: "Prompt",
    question: "What is a prompt?",
    definition:
      "The instruction you give to an AI model. In practice, a good prompt consists of a role (who the AI should be), context (what it is working with), and a concrete task."
  },
  {
    slug: "prompt-engineering",
    term: "Prompt engineering",
    question: "What is prompt engineering?",
    definition:
      "The discipline of writing prompts that consistently produce good results. Less 'magic' than many assume — mostly about being precise, giving examples, and structuring the task clearly."
  },
  {
    slug: "context-window",
    term: "Context window",
    question: "What is a context window?",
    definition:
      "The maximum amount of text (measured in tokens) a model can read at once. Affects how much documentation or history an agent can consider in one call. Modern models have 200k–1M tokens."
  },
  {
    slug: "token",
    term: "Token",
    question: "What is a token?",
    definition:
      "The smallest text unit a language model processes — typically a syllable or short word. In English, one word is often 1–2 tokens. Pricing and context limits are counted in tokens, not words."
  },
  {
    slug: "hallucination",
    term: "Hallucination",
    question: "What is a hallucination in AI?",
    definition:
      "When an AI model invents something that looks credible but is wrong. A real problem handled with concrete context (RAG), approval gates, and having the agent cite sources."
  },
  {
    slug: "fine-tuning",
    term: "Fine-tuning",
    question: "What is fine-tuning a model?",
    definition:
      "Training an existing model further on your own examples so it becomes better at a specific task. Less common now that context windows are large enough to inject examples into the prompt instead."
  },
  {
    slug: "embedding",
    term: "Embedding",
    question: "What is an embedding?",
    definition:
      "A numerical representation of text that captures its meaning. Used for search and similarity comparison — two documents with similar meaning get similar embeddings."
  },
  {
    slug: "vector-database",
    term: "Vector database",
    question: "What is a vector database?",
    definition:
      "A database that stores embeddings and can search for the most similar ones. The backbone of RAG solutions. Examples: Pinecone, Weaviate, pgvector (PostgreSQL extension)."
  },
  {
    slug: "inference",
    term: "Inference",
    question: "What is inference in AI?",
    definition:
      "The act of the model generating a response — as opposed to training. When you pay for AI usage, you typically pay for inference, measured in tokens in and tokens out."
  },
  {
    slug: "mcp",
    term: "MCP (Model Context Protocol)",
    question: "What is MCP?",
    definition:
      "An open protocol from Anthropic for how AI agents connect to tools and data sources. Lets you reuse the same integration across different AI clients — Claude Desktop, Cursor, your own agents."
  },
  {
    slug: "human-in-the-loop",
    term: "Human-in-the-loop",
    question: "What does 'human-in-the-loop' mean?",
    definition:
      "A design pattern where AI does the groundwork, but a person approves before anything is executed. Used for all outgoing actions (customer emails, invoices, payments) in all Crunchtime deliverables."
  },
  {
    slug: "escalation",
    term: "Escalation",
    question: "What does escalation mean for an AI agent?",
    definition:
      "When the agent hands the task to a human because it is uncertain, the task falls outside its rules, or something significant is at stake (money, legal, customer relationships). Good escalation = fewer errors in production."
  },
  {
    slug: "audit-log",
    term: "Audit log",
    question: "What is an audit log for an AI agent?",
    definition:
      "A complete, timestamped record of what the agent has done: which tools it called, with what arguments, what it received back, what it chose. Critical for debugging, compliance, and trust."
  },
  {
    slug: "ai-pilot",
    term: "AI pilot",
    question: "What is an AI pilot?",
    definition:
      "A time-bounded, scope-bounded implementation of one concrete AI workflow to prove value before scaling. In Crunchtime's case: 3–5 weeks, fixed price, delivered with a runbook."
  },
  {
    slug: "discovery-sprint",
    term: "Discovery Sprint",
    question: "What is a Discovery Sprint?",
    definition:
      "Crunchtime's 1–2 week initial engagement: we go through your processes, identify 3–5 automation candidates, score them on hours saved, and deliver a prioritised plan. NOK 15,000; credited toward the pilot."
  },
  {
    slug: "feedback-loop",
    term: "Feedback loop",
    question: "What is a feedback loop in AI?",
    definition:
      "The mechanism for collecting signals on how well the agent is doing its job (approved vs. rejected, reworked, complained about) and using that to improve it over time. Without a feedback loop, quality drifts."
  },
  {
    slug: "ai-policy",
    term: "AI policy",
    question: "What is an AI policy?",
    definition:
      "The written rules for what an AI agent is and is not allowed to do in the company — which data it can see, which actions require approval, who is responsible. First deliverable in all mature implementations."
  },
  {
    slug: "bias",
    term: "Bias",
    question: "What is bias in an AI model?",
    definition:
      "Systematic skews in what the model produces — because the training data was skewed, because the prompt steers toward a particular angle, or because feedback signals are biased. Measured and mitigated, not ignored."
  },
  {
    slug: "ai-evaluation",
    term: "AI evaluation (eval)",
    question: "What is an AI evaluation?",
    definition:
      "A set of test cases with known answers that are run against the agent regularly to check quality. Like unit tests, but for AI. Makes it possible to upgrade models or change prompts without losing what was working."
  }
];
