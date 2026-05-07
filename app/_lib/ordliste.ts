// Norsk AI-ordliste for /no/ordliste.
// Hver post er skrevet som et Q&A-par så definisjonen kan plukkes opp
// som FAQPage / DefinedTerm av AI-søkemotorer. Definisjonene er
// bevisst korte og siterbare.

export interface GlossaryTerm {
  slug: string; // brukes som anchor-id og som en del av URL-fragment
  term: string;
  question: string;
  definition: string;
  // Valgfri lengre forklaring (vises på siden, men ikke i Q&A-schema)
  detail?: string;
}

export const ORDLISTE: GlossaryTerm[] = [
  {
    slug: "ai-agent",
    term: "AI-agent",
    question: "Hva er en AI-agent?",
    definition:
      "En AI-agent er et program som tar en oppgave, planlegger stegene den trenger, kaller verktøy (e-post, regneark, API-er) for å utføre dem, og leverer et resultat — uten at en person må styre hver handling.",
    detail:
      "I praksis består en AI-agent av tre ting: en stor språkmodell som tar avgjørelser, et sett verktøy den kan kalle, og en løkke som lar den jobbe i flere steg. Den skiller seg fra en chatbot ved at den faktisk gjør noe — ikke bare svarer."
  },
  {
    slug: "agentbasert-system",
    term: "Agentbasert system",
    question: "Hva er et agentbasert system?",
    definition:
      "Et agentbasert system er en samling spesialiserte AI-agenter som samarbeider om en jobb. Én agent kan hente data, en annen analyserer, en tredje skriver svaret — i stedet for at én generell agent gjør alt."
  },
  {
    slug: "ai-arbeidsflyt",
    term: "AI-arbeidsflyt",
    question: "Hva er en AI-arbeidsflyt?",
    definition:
      "En AI-arbeidsflyt er en kjede av steg der AI håndterer hvert steg automatisk — for eksempel: motta e-post → klassifisér → trekk ut data → opprett oppgave i CRM → send bekreftelse. Mennesket godkjenner kun unntak."
  },
  {
    slug: "agentisk-ai",
    term: "Agentisk AI",
    question: "Hva betyr 'agentisk AI'?",
    definition:
      "Agentisk AI betyr AI som handler på egne vegne i stedet for bare å svare på spørsmål. Forskjellen er aktiv vs. passiv: en chatbot venter på at du spør; en agentisk AI utfører oppgaver i bakgrunnen."
  },
  {
    slug: "multi-agent",
    term: "Multi-agent system",
    question: "Hva er et multi-agent system?",
    definition:
      "Flere AI-agenter med ulike spesialiteter som koordinerer for å løse en oppgave sammen. Brukes når én oppgave er for stor eller for variert til at en enkelt agent kan håndtere alt godt."
  },
  {
    slug: "autonom-agent",
    term: "Autonom agent",
    question: "Hva er en autonom agent?",
    definition:
      "En agent som tar avgjørelser uten menneskelig godkjenning på hvert steg. Autonomien er som regel begrenset av regler (kan kun bruke disse verktøyene) og godkjenningsporter (krever bekreftelse før den sender penger eller e-post utenfor selskapet)."
  },
  {
    slug: "verktoybruk",
    term: "Verktøybruk (tool use)",
    question: "Hva betyr verktøybruk for en AI-agent?",
    definition:
      "Verktøybruk er evnen en agent har til å kalle eksterne funksjoner — søke på nettet, lese fra en database, sende e-post, opprette en faktura. Det er forskjellen mellom en agent som kan tenke og en som kan handle."
  },
  {
    slug: "funksjonskall",
    term: "Funksjonskall (function calling)",
    question: "Hva er funksjonskall i AI?",
    definition:
      "En måte å la språkmodellen velge og kalle en spesifikk funksjon med riktige argumenter. Det er mekanismen som gjør verktøybruk mulig i praksis. OpenAI, Anthropic og andre tilbyr dette som et innebygd API."
  },
  {
    slug: "agent-orkestrering",
    term: "Agent-orkestrering",
    question: "Hva er agent-orkestrering?",
    definition:
      "Logikken som styrer hvilken agent gjør hva, i hvilken rekkefølge, og hvordan resultater flyter mellom dem. Tenk dirigent — orkestreringen er ikke en agent selv, men reglene som koordinerer dem."
  },
  {
    slug: "llm",
    term: "Stor språkmodell (LLM)",
    question: "Hva er en LLM?",
    definition:
      "En 'large language model' er en maskinlæringsmodell trent på store mengder tekst. Den kan skrive, sammenfatte, klassifisere og resonnere på naturlig språk. Eksempler: GPT-5, Claude 4.7, Gemini 2.5."
  },
  {
    slug: "rag",
    term: "RAG (Retrieval-Augmented Generation)",
    question: "Hva er RAG?",
    definition:
      "RAG er et mønster der AI-en henter relevant informasjon fra dine egne dokumenter eller database før den svarer. Brukes når du vil at agenten skal kunne ditt selskap, ikke bare det den ble trent på."
  },
  {
    slug: "prompt",
    term: "Prompt",
    question: "Hva er en prompt?",
    definition:
      "Instruksjonen du gir til en AI-modell. I praksis består en god prompt av en rolle (hvem AI-en skal være), kontekst (hva den jobber med), og en konkret oppgave."
  },
  {
    slug: "prompt-engineering",
    term: "Prompt-engineering",
    question: "Hva er prompt-engineering?",
    definition:
      "Disiplinen å skrive prompts som gir konsistent gode resultater. Mindre 'tryll' enn mange tror — handler mest om å være presis, gi eksempler, og strukturere oppgaven."
  },
  {
    slug: "kontekstvindu",
    term: "Kontekstvindu",
    question: "Hva er et kontekstvindu?",
    definition:
      "Den maksimale mengden tekst (målt i tokens) en modell kan lese på én gang. Påvirker hvor mye dokumentasjon eller historikk en agent kan ta hensyn til i ett kall. Moderne modeller har 200k–1M tokens."
  },
  {
    slug: "token",
    term: "Token",
    question: "Hva er en token?",
    definition:
      "Den minste tekstenheten en språkmodell behandler — typisk en stavelse eller et kort ord. På norsk er ett ord ofte 1–2 tokens. Pris og kontekstgrenser regnes i tokens, ikke ord."
  },
  {
    slug: "hallusinasjon",
    term: "Hallusinasjon",
    question: "Hva er en hallusinasjon i AI-sammenheng?",
    definition:
      "Når en AI-modell finner på noe som ser troverdig ut men er feil. Et reelt problem som håndteres med konkret kontekst (RAG), godkjenningsporter, og at agenten siterer kilder."
  },
  {
    slug: "finjustering",
    term: "Finjustering (fine-tuning)",
    question: "Hva er finjustering av en modell?",
    definition:
      "Å trene en eksisterende modell videre på dine egne eksempler så den blir bedre på en spesifikk oppgave. Mindre vanlig nå som kontekstvinduer er store nok til at man heller injiserer eksempler i prompten."
  },
  {
    slug: "embedding",
    term: "Embedding",
    question: "Hva er en embedding?",
    definition:
      "En tallrepresentasjon av tekst som fanger meningsinnholdet. Brukes til søk og likhetssammenligning — to dokumenter med liknende mening får liknende embeddings."
  },
  {
    slug: "vektordatabase",
    term: "Vektordatabase",
    question: "Hva er en vektordatabase?",
    definition:
      "En database som lagrer embeddings og kan søke etter de mest like. Ryggraden i RAG-løsninger. Eksempler: Pinecone, Weaviate, pgvector (PostgreSQL-utvidelse)."
  },
  {
    slug: "inferens",
    term: "Inferens",
    question: "Hva er inferens i AI?",
    definition:
      "Selve handlingen at modellen genererer et svar — i motsetning til trening. Når du betaler for AI-bruk, betaler du som regel for inferens, målt i tokens inn og tokens ut."
  },
  {
    slug: "mcp",
    term: "MCP (Model Context Protocol)",
    question: "Hva er MCP?",
    definition:
      "En åpen protokoll fra Anthropic for hvordan AI-agenter kobles til verktøy og datakilder. Lar deg gjenbruke samme integrasjon på tvers av ulike AI-klienter — Claude Desktop, Cursor, egne agenter."
  },
  {
    slug: "menneske-i-loopen",
    term: "Menneske-i-loopen",
    question: "Hva betyr 'menneske-i-loopen'?",
    definition:
      "Et designmønster der AI gjør forarbeid, men en person godkjenner før noe utføres. Brukes på alt utgående (e-post til kunder, fakturaer, betalinger) i alle Crunchtimes leveranser."
  },
  {
    slug: "eskalering",
    term: "Eskalering",
    question: "Hva betyr eskalering for en AI-agent?",
    definition:
      "Når agenten gir oppgaven til et menneske fordi den er usikker, oppgaven faller utenfor reglene, eller noe står på spill (penger, juss, kundeforhold). Bra eskalering = færre feil i produksjon."
  },
  {
    slug: "audit-logg",
    term: "Audit-logg",
    question: "Hva er en audit-logg for en AI-agent?",
    definition:
      "Komplett, tidsstemplet logg over hva agenten har gjort: hvilke verktøy den kalte, med hvilke argumenter, hva den fikk tilbake, hva den valgte. Kritisk for feilsøking, samsvar og tillit."
  },
  {
    slug: "ai-pilot",
    term: "AI-pilot",
    question: "Hva er en AI-pilot?",
    definition:
      "En tidsavgrenset, scope-avgrenset implementasjon av én konkret AI-arbeidsflyt for å bevise verdi før man skalerer. I Crunchtimes tilfelle: 3–5 uker, fast pris, levert med runbook."
  },
  {
    slug: "discovery-sprint",
    term: "Discovery Sprint",
    question: "Hva er en Discovery Sprint?",
    definition:
      "Crunchtimes 1–2 ukers innledende oppdrag: vi går gjennom prosessene, identifiserer 3–5 kandidater for automatisering, scorer dem på timer spart, og leverer en prioritert plan. 15 000 NOK; krediteres mot pilot."
  },
  {
    slug: "tilbakekobling",
    term: "Tilbakekobling (feedback loop)",
    question: "Hva er en tilbakekobling i AI-sammenheng?",
    definition:
      "Mekanismen for å samle inn signaler om hvor godt agenten gjør jobben (godkjent vs. avvist, omarbeidet, klaget på) og bruke det til å forbedre den over tid. Uten tilbakekobling driver kvaliteten."
  },
  {
    slug: "ai-policy",
    term: "AI-policy",
    question: "Hva er en AI-policy?",
    definition:
      "De skriftlige reglene for hva en AI-agent får og ikke får gjøre i bedriften — hvilke data den kan se, hvilke handlinger som krever godkjenning, hvem som er ansvarlig. Første leveranse i alle modne implementasjoner."
  },
  {
    slug: "bias",
    term: "Skjevhet (bias)",
    question: "Hva er bias i en AI-modell?",
    definition:
      "Systematiske skjevheter i hva modellen produserer — fordi treningsdataene var skjeve, fordi prompten styrer mot en bestemt vinkel, eller fordi feedback-signaler er skjeve. Måles og motvirkes, ikke ignoreres."
  },
  {
    slug: "ai-evaluering",
    term: "AI-evaluering (eval)",
    question: "Hva er en AI-evaluering?",
    definition:
      "Et sett testtilfeller med kjent fasit som kjøres mot agenten regelmessig for å sjekke kvalitet. Som enhetstester, men for AI. Gjør det mulig å oppgradere modeller eller endre prompts uten å miste det som fungerte."
  }
];
