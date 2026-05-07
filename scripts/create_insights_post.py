"""Create the first Crunchtime Insights post in Notion.

Reads NOTION_TOKEN and NOTION_INSIGHTS_DATABASE_ID from the environment
(the same variables the live app uses). NEVER hardcode tokens in this
file — they end up in git history and become a permanent leak.
"""
import json
import os
import sys
import urllib.request
import urllib.error

NOTION_TOKEN = os.environ.get("NOTION_TOKEN")
DB_ID = os.environ.get("NOTION_INSIGHTS_DATABASE_ID")

if not NOTION_TOKEN or not DB_ID:
    sys.stderr.write(
        "Missing NOTION_TOKEN or NOTION_INSIGHTS_DATABASE_ID. Source .env.local first.\n"
    )
    sys.exit(1)


def t(content, bold=False, link=None):
    """Build a rich-text element."""
    obj = {"type": "text", "text": {"content": content}}
    if bold:
        obj["annotations"] = {"bold": True}
    if link:
        obj["text"]["link"] = {"url": link}
    return obj


def p(*rich_text):
    return {"object": "block", "type": "paragraph",
            "paragraph": {"rich_text": list(rich_text)}}


def h2(content):
    return {"object": "block", "type": "heading_2",
            "heading_2": {"rich_text": [t(content)]}}


def h3(content):
    return {"object": "block", "type": "heading_3",
            "heading_3": {"rich_text": [t(content)]}}


def bullet(*rich_text):
    return {"object": "block", "type": "bulleted_list_item",
            "bulleted_list_item": {"rich_text": list(rich_text)}}


def divider():
    return {"object": "block", "type": "divider", "divider": {}}


def callout(content, emoji="💡"):
    return {
        "object": "block",
        "type": "callout",
        "callout": {
            "rich_text": [t(content)],
            "icon": {"type": "emoji", "emoji": emoji},
        },
    }


children = [
    # PAIN — opening that mirrors the title
    p(t("Klokken er 14:47 på en tirsdag. En potensiell kunde fyller ut kontaktskjemaet på nettsiden din og trykker «send». De leter aktivt etter noen som kan løse problemet. De er klare til å kjøpe.")),
    p(t("Du sitter i møte.")),
    p(t("Klokken 16:20 sjekker du innboksen og ser henvendelsen. Du skriver en hyggelig og ryddig e-post og sender. Leaden svarer ikke. Kanskje de fant noen andre. Kanskje de bare glemte det — det er fristende å fortelle seg selv det siste.")),
    p(t("Sannheten er mer ubehagelig: de fant noen andre i løpet av de timene du var utilgjengelig. Dette er ikke unikt for deg. Det er et strukturelt problem som rammer nær sagt alle norske SMB-er som genererer leads digitalt. Og det finnes ett tall som forklarer akkurat hvorfor.")),

    # THE MATH — direct answer in first 1-3 sentences with cited stat
    h2("Matematikken som forklarer alt"),
    p(
        t("Svarer du en ny henvendelse innen 5 minutter, er sjansen for å kvalifisere den til et reelt salgsmøte "),
        t("21 ganger høyere", bold=True),
        t(" enn om du svarer etter 30 minutter. Og sjansen fortsetter å falle for hvert minutt som går. Dette er ikke en marginal forskjell — det er i praksis to ulike utfall for den samme henvendelsen ("),
        t("kilde: Outreach / InsideSales-forskning", link="https://www.outreach.io/resources/blog/automate-sales-follow-up-with-ai-step-by-step-guide"),
        t(")."),
    ),
    p(t("Årsaken er enkel: en person som fyller ut et kontaktskjema er i en aktiv beslutningsprosess. De har et problem de vil løse nå. De sammenligner sannsynligvis flere leverandører, og den første som responderer på en relevant og kompetent måte, setter agendaen. De resterende er en backup.")),
    p(t("Problemet er at 5 minutter ikke er et realistisk mål for et menneske med en full arbeidsdag, kunder å betjene, og et team å lede. Det er derimot et trivielt mål for en AI-agent.")),

    # WHY IT HAPPENS — root causes not symptoms
    h2("Rotårsaken — det handler ikke om latskap"),
    p(t("Det er lett å lese statistikken ovenfor og konkludere med at løsningen er å «jobbe raskere» eller ansette dedikert salgspersonell. Ingen av delene treffer rotproblemet.")),
    p(
        t("Det første strukturelle problemet er at "),
        t("leads er asynkrone, men menneskelig kapasitet ikke er det.", bold=True),
        t(" Henvendelser kommer inn søndag morgen, midt i kundemøter, i juleferien og fem minutter før lunsj. De forutsetter ikke at du er tilgjengelig. En menneskelig salgsprosess er i bunn og grunn seriell — én ting av gangen."),
    ),
    p(t("Det andre problemet er eierskap. I mange norske SMB-er havner inngående leads i en delt innboks der alle tror noen andre tar det. Det er ingen ondsinnet intensjon — det er en vanlig konsekvens av at ingen har en tydelig rolle. Resultatet er at leaden venter, og til sist faller av.")),
    p(t("Det tredje problemet er kvalifiseringsarbeidet. Selv om du svarer raskt, bruker du 10–15 minutter på å finne ut om dette faktisk er relevant: er de i riktig geografi, er budsjettet realistisk, er behovet innenfor det du leverer? Dette er tid du ikke har midt i arbeidsdagen — og det betyr at hurtig respons alene ikke er nok.")),
    p(t("En AI-agent løser alle tre problemene simultant, og gjør det kontinuerlig — ikke bare i ukene der du tilfeldigvis er ekstra på.")),

    # THE AGENT
    h2("Agenten som fikser det — hva den faktisk gjør"),
    p(t("Når et lead fyller ut et skjema — enten det er via nettsiden din, en Calendly-link, HubSpot, eller e-post — utløses agenten umiddelbart. Ikke etter fem minutter. Ikke neste gang noen husker å sjekke. Umiddelbart.")),

    h3("Steg 1: Mottak og personlig bekreftelse"),
    p(t("Leaden får et svar innen sekunder. Ikke et generisk autosvar med «takk for henvendelsen din»-tekst, men en kontekstuell bekreftelse basert på hva de faktisk spurte om. Agenten leser henvendelsen og svarer som en kompetent medarbeider — på norsk, med relevant informasjon.")),

    h3("Steg 2: Kvalifisering"),
    p(t("Agenten stiller 2–3 avklarende spørsmål tilpasset bransjen og forespørselen. For et regnskapsbyrå: antall ansatte, hvilken regnskapsprogramvare de bruker i dag, og hva de vil bort fra. For en advokat: type sak og tidshorisont. Svarene brukes til å vurdere om dette er verdt å prioritere, og på hvilket nivå.")),

    h3("Steg 3: Berikelse"),
    p(t("Agenten slår automatisk opp firmaet i Proff.no eller LinkedIn Company Search, henter nøkkeldata — bransje, omsetning, antall ansatte, nøkkelpersoner — og legger det til lead-profilen. Du møter aldri en potensiell kunde du ikke vet noe om.")),

    h3("Steg 4: Ruting"),
    p(t("Basert på kvalifisering og berikelse ruter agenten leaden til riktig person i teamet med et klart sammendrag: hvem de er, hva de trenger, og hvorfor de er aktuelle. Ikke bare en forwarding av den originale e-posten.")),

    h3("Steg 5: CRM-oppføring"),
    p(t("Agenten oppretter automatisk et lead-kort i CRM-et ditt — HubSpot, Pipedrive, eller hva du bruker — med alle relevante felter fylt ut: firma, kontaktperson, kilde, kvalifiseringsscore, og sammendrag av dialogen.")),

    h3("Steg 6: Møtebooking"),
    p(t("Hvis leaden er kvalifisert og klar, tilbyr agenten konkrete ledige tidspunkter direkte i e-posten og lar dem booke umiddelbart via Calendly eller Cal.com. Ingen fram-og-tilbake, ingen ventetid på at noen sjekker kalenderen.")),

    h3("Steg 7: Intern varsling"),
    p(t("Ansvarlig konsulent eller selger får et Slack-varsel med sammendrag, score og direkte lenke til CRM-kortet. De trenger aldri å lete etter informasjon.")),

    p(t("Hele løkken tar under tre minutter. Leaden opplever en responsiv og godt forberedt bedrift. Du opplever et ferdig kvalifisert lead med alt du trenger allerede gjort.")),

    # TOOLS
    h2("Verktøy med relevans for norske SMB-er"),
    p(t("Det finnes ikke én plattform som gjør alt dette ut av esken. En fungerende lead-agent er satt sammen av spesialiserte verktøy som kommuniserer med hverandre.")),

    bullet(
        t("HubSpot", bold=True),
        t(" er naturlig base for de som allerede bruker eller vurderer et CRM med markedsautomatisering. Breeze AI gir en viss innebygd automatisering, men for en fullstendig agentløkke trenger du et orkestreringslag utenfor HubSpot."),
    ),
    bullet(
        t("Pipedrive", bold=True),
        t(" er spesielt populært blant norske gründer- og konsulentfirmaer. API-et er ryddig og integrasjonsmulighetene gode. Enklere å starte med enn HubSpot; AI-mulighetene er foreløpig mer begrenset."),
    ),
    bullet(
        t("Calendly / Cal.com", bold=True),
        t(" er standardverktøyene for booking. Cal.com er åpen kildekode og kan egenhostes — relevant for de som vil holde data innenfor norsk infrastruktur. Begge støtter round-robin routing der møter fordeles automatisk mellom tilgjengelige konsulenter."),
    ),
    bullet(
        t("n8n / Make.com", bold=True),
        t(" er orkestreringslaget som binder det hele sammen — det som lar agenten ta beslutninger, ikke bare flytte data. n8n kan egenhostes med full kontroll; Make.com er enklere å starte med men koster per operasjon."),
    ),

    p(t("For de mer komplekse kvalifiseringssamtalene — der agenten må tolke et fritekstproblem og stille relevante oppfølgingsspørsmål — kobler vi typisk inn en stor språkmodell via API. Det er her agenten slutter å oppføre seg som en automatisering og begynner å oppføre seg som en kollega.")),

    # WHAT CHANGES WITH NUMBERS
    h2("Hva endrer seg — med tall"),
    p(t("La oss gå bort fra det hypotetiske og se på hva dokumenterte implementasjoner faktisk viser:")),

    bullet(
        t("21× høyere kvalifiseringsrate", bold=True),
        t(" ved svar innen 5 minutter versus 30+ minutter — konsistent på tvers av bransjer ("),
        t("Outreach / InsideSales", link="https://www.outreach.io/resources/blog/automate-sales-follow-up-with-ai-step-by-step-guide"),
        t(")."),
    ),
    bullet(
        t("3,4× flere avsluttede avtaler", bold=True),
        t(" i eiendomsmarkedet for firmaer med AI-first kvalifisering, analysert over 20 000 deals — en bransje der prospekter kontakter flere aktører simultant og sjelden venter ("),
        t("iSpeedToLead", link="https://ispeedtolead.com/blog/how-ai-lead-scoring-actually-works-in-real-estate-using-20000-deal-data/"),
        t(")."),
    ),
    bullet(
        t("Fra 16 timer til 4 minutter", bold=True),
        t(" i responstid for advokatfirmaer som innførte AI-assistert klienthåndtering — med 437 timer spart på tvers av seks saker i piloten ("),
        t("Clio", link="https://www.clio.com/blog/ai-for-small-law-firms/"),
        t(")."),
    ),

    p(t("Det er ikke slik at alle leads konverterer bare fordi du svarer raskt — mange forespørsler er feil match uansett. Men de som er klare til å kjøpe og mangler en god grunn til å velge deg fremfor konkurrenten, konverterer for den av dere som er tilstede. I dag er det sannsynligvis ikke deg.")),

    callout(
        "En godt bygget lead-agent erstatter ikke selgeren. Den sørger for at selgeren aldri mer starter en samtale med en kald prospect — kun med varme leads som allerede vet hvem dere er og hva dere tilbyr.",
        "🎯",
    ),

    # BUILD VS HIRE
    h2("Bygg det selv eller hyr oss — en ærlig sammenligning"),
    p(t("Å bygge en lead-agent er teknisk sett gjennomførbart for de fleste som er komfortable med API-er og kan sette av tid. Komponentene finnes og er godt dokumentert.")),
    p(t("Utfordringen er ikke teknologien. Det er konteksten og vedlikeholdet.")),
    p(t("En agent som fungerer for et regnskapsbyrå i Bergen er annerledes enn en som fungerer for et konsulentselskap i Oslo. Kvalifiseringsspørsmålene er forskjellige. Rutingslogikken varierer. Hvilke felter som skal fylles i CRM-et avhenger av salgsprosessen din, ikke av en generisk mal.")),
    p(t("En realistisk selvbygget agent krever 40–80 timer å sette opp skikkelig, inkludert testing, feilhåndtering, og den iterasjonen som skjer etter at du oppdager edge cases du ikke tenkte på da du designet den. I tillegg krever den jevnlig vedlikehold når API-er oppdateres eller arbeidsflytene dine endres.")),
    p(t("Mange norske SMB-eiere har ikke en intern teknisk person med kapasitet til dette. De har en travel hverdag der et 80-timers prosjekt med uklar tidshorisont er en høy pris å betale — uavhengig av potensiell ROI.")),
    p(
        t("Alternativet er en "),
        t("Discovery Sprint", bold=True),
        t(" med Crunchtime: en avgrenset engasjement der vi kartlegger din eksakte salgsprosess, identifiserer de tre til fem automatiseringspunktene med størst effekt, og leverer en fullstendig implementasjon med dokumentasjon og opplæring. To til tre uker. Du eier alt etterpå — ingen vendor lock-in, ingen løpende konsulentavhengighet."),
    ),

    divider(),

    # CTA
    h2("Book en Discovery Sprint"),
    p(t("Hvis du kjenner igjen dette mønsteret — leads som kjøles ned, oppfølging som skjer for sent, ingen systematikk på inngående henvendelser — er neste steg konkret.")),
    p(t("En Discovery Sprint starter med 90 minutter der vi går gjennom din nåværende salgsprosess, kartlegger flaskehalsene, og gir deg et klart bilde av hva en agent faktisk ville endret for akkurat deg — med estimat og teknisk plan inkludert. Ingen generisk rådgivning, ingen salgspress.")),
    p(
        t("→ "),
        t("Ta kontakt og book en Discovery Sprint", bold=True, link="https://crunchtime.no/no/kontakt"),
        t(" — eller send oss en e-post på hello@crunchtime.no og forklar situasjonen din kort. Vi svarer innen én virkedag."),
    ),
]

payload = {
    "parent": {"database_id": DB_ID},
    "properties": {
        "Title": {
            "title": [{"text": {"content": "Hvorfor leads dør på 5 minutter — og agenten som fikser det"}}]
        },
        "Slug": {"rich_text": [{"text": {"content": "hvorfor-leads-dor-pa-5-minutter"}}]},
        "Locale": {"select": {"name": "no"}},
        "Status": {"select": {"name": "draft"}},
        "Author": {"rich_text": [{"text": {"content": "Christian Bru"}}]},
        "Excerpt": {
            "rich_text": [{
                "text": {
                    "content": "De fleste SMB-er mister leads ikke fordi de mangler salgsevner, men fordi de svarer for sent. Svarer du innen 5 minutter, er sjansen for å kvalifisere leaden 21 ganger høyere."
                }
            }]
        },
        "Subtitle": {
            "rich_text": [{
                "text": {
                    "content": "En AI-agent svarer for deg mens du er opptatt — her er hva den faktisk gjør og hva tallene viser."
                }
            }]
        },
        "Vertical": {"multi_select": [{"name": "services"}, {"name": "general"}]},
        "Tags": {
            "multi_select": [
                {"name": "leads"},
                {"name": "AI-agent"},
                {"name": "salg"},
                {"name": "CRM"},
                {"name": "automatisering"},
            ]
        },
        "Featured": {"checkbox": True},
        "Sources": {
            "rich_text": [{
                "text": {
                    "content": "\n".join([
                        "Outreach / InsideSales — https://www.outreach.io/resources/blog/automate-sales-follow-up-with-ai-step-by-step-guide — 2025-06-17",
                        "iSpeedToLead — https://ispeedtolead.com/blog/how-ai-lead-scoring-actually-works-in-real-estate-using-20000-deal-data/ — 2025-04-08",
                        "Clio — https://www.clio.com/blog/ai-for-small-law-firms/ — 2025-01-29",
                    ])
                }
            }]
        },
    },
    "children": children,
}

data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    "https://api.notion.com/v1/pages",
    data=data,
    headers={
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
    },
    method="POST",
)

try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode())
        print("SUCCESS")
        print("Page ID:", result.get("id"))
        print("URL:", result.get("url"))
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print("ERROR", e.code)
    print(body[:3000])
