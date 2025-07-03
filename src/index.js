#!/usr/bin/env node
import { execSync } from "child_process";
import inquirer from "inquirer";
import chalk from "chalk";
import { resolve, join } from "path";
import { homedir } from "os";
import { existsSync, readFileSync } from "fs";
import fetch from "node-fetch";

// Configurazione
function loadConfig() {
  console.log(chalk.blue("🔧 Caricamento configurazione..."));

  // Cerca nella repository corrente
  const localConfigPath = resolve(
    process.cwd(),
    "gch.config.json"
  );

  if (existsSync(localConfigPath)) {
    console.log("Sto usando configurazione del progetto");
    return JSON.parse(readFileSync(localConfigPath, "utf-8"));
  }

  throw new Error(
    "File di configurazione non trovato. Crea gch.config.json nella tua repository."
  );
}

// score di review minimo
const MIN_REVIEW_SCORE = 7;

// Configurazione predefinita
const MIN_TOKEN_LENGTH = 3000;

// Esempio di uso
const config = loadConfig();

if (!config.geminiApiKey) {
  console.error(
    chalk.red("ERRORE: Chiave API key non configurata."),
  );
  process.exit(1);
}

// Configurazione Conventional Commits
const COMMIT_TYPES = [
  { name: "feat", description: "Una nuova funzionalità" },
  { name: "fix", description: "Una correzione di bug" },
  { name: "docs", description: "Modifiche alla documentazione" },
  { name: "style", description: "Formattazione, stile" },
  { name: "refactor", description: "Refactoring del codice" },
  { name: "perf", description: "Miglioramento delle prestazioni" },
  { name: "test", description: "Aggiunta o modifica di test" },
  { name: "chore", description: "Attività di manutenzione" },
  { name: "BREAKING CHANGE", description: "Modifica che rompe la compatibilità" },
];

async function askGeminiForReview(diff) {
  const reviewPrompt = `ANALISI CODICE - ISTRUZIONI STRETTE

***Obiettivo:*** 
Valutare le modifiche con un voto da 1 a 10 (${MIN_REVIEW_SCORE}+ = sufficiente) e fornire feedback strutturato.

***Regole di risposta:***
1. Rispondi SOLO in formato testo semplice (NO markdown/codice)
2. Usa elenchi puntati per chiarezza
3. Termina con "Score: X/10" (X = voto numerico)

***Parametri di valutazione:***
• Qualità: 
  - Leggibilità (naming, formattazione)
  - Struttura (logica, organizzazione)
  - Stile (consistenza, best practices)

• Correttezza:
  - Funzionalità raggiunte
  - Bug risolti (se applicabile)
  - Edge cases considerati

• Manutenibilità:
  - Modularità
  - Testabilità 
  - Documentazione implicita

• Problemi critici:
  - Errori evidenti
  - Vulnerabilità
  - Anti-pattern

***Formato richiesto:***
1. Qualità: <feedback conciso>
2. Correttezza: <feedback conciso> 
3. Manutenibilità: <feedback conciso>
4. Problemi: <lista problemi o "Nessuno">

Score: X/10

***Diff da analizzare:***
${diff.substring(0, MIN_TOKEN_LENGTH)}

***Nota importante:*** 
Se il diff è vuoto o irrilevante, rispondi con:
1. Qualità: Nessuna modifica rilevante
2. Correttezza: Nessuna modifica rilevante
3. Manutenibilità: Nessuna modifica rilevante 
4. Problemi: Diff non analizzabile
Score: 0/10`;

  try {
    const result = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: reviewPrompt }] }],
        }),
      }
    );
    const response = await result.json();
    return response?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch (error) {
    console.error(
      chalk.yellow("⚠ Errore durante la review Gemini:"),
      error.message
    );
    return null;
  }
}

async function askGeminiForGeneratedCommitMessage(diff) {
    if (!diff) {
      console.log(chalk.yellow("Nessuna modifica staged per il commit"));
      process.exit(1);
    }

    // 1. Supporto per commit multipli
    const stagedFiles = execSync("git diff --name-only --cached")
      .toString()
      .split("\n")
      .filter(Boolean);
    console.log(
      chalk.blue(
        `File modificati (${stagedFiles.length}):\n${stagedFiles.join("\n")}`
      )
    );

    // 2. Integrazione con commit convenzionali
    const { commitType } = await inquirer.prompt([
      {
        type: "list",
        name: "commitType",
        message: "Seleziona il tipo di commit:",
        default: config.defaultCommitType,
        validate: (input) =>
          COMMIT_TYPES.some((type) => type.name === input) ||
          "Tipo di commit non valido",
        // Mostra le opzioni con descrizione
        choices: COMMIT_TYPES.map((type) => ({
          name: `${type.name.padEnd(8)} - ${type.description}`,
          value: type.name,
        })),
      }
    ]);

    // Genera prompt per Gemini
    const prompt = `Genera UN SOLO messaggio di commit seguendo STRETTAMENTE queste regole:

REGOLE OBBLIGATORIE:
1. Formato: <tipo>(<ambito>)?: <descrizione>
2. Lunghezza TOTALE MASSIMA: 50 caratteri (controlla prima di rispondere)
3. Lingua: inglese
4. Struttura:
   - Tipo: ${commitType}
   - Ambito opzionale (solo se strettamente necessario)
   - ": " (due punti + spazio)
   - Descrizione concisa in inglese

ESEMPI VALIDI (<=50 caratteri):
- feat(auth): add login endpoint
- fix: resolve header overflow
- docs: update api examples

ESEMPI NON VALIDI:
- "feat: add new login system with email validation" (troppo lungo)
- "fix: bug" (troppo vago)

RICHIESTA:
Analizza questo diff e genera SOLO il messaggio di commit (senza commenti aggiuntivi) che:
1. Segua ESATTAMENTE il formato sopra
2. Sia <=50 caratteri
3. Descriva CONCISAMENTE le modifiche

Diff: ${diff.substring(0, MIN_TOKEN_LENGTH)}`;
    console.log(chalk.blue("📥​ Prompt inviato a Gemini"));
    console.log(chalk.blue("⌛​ Attendi qualche secondo per la risposta..."));
    try {
      const result = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );
      const response = await result.json();
      return response?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (error) {
      console.error(
        chalk.yellow("⚠️​ Errore durante la review Gemini:"),
        error.message
      );
      return null;
    }
}

function validateMessage(msg)  {
  const subject = msg.trim(); // Trim per sicurezza

  console.log(chalk.blue(`Messaggio di commit generato => ${subject}`));

  // Verifica lunghezza soggetto
  if (subject.length > config.maxSubjectLength) {
    console.log(chalk.red(`La riga soggetto supera ${config.maxSubjectLength} caratteri (${subject.length})`));
    return false;
  }

  const commitType = COMMIT_TYPES.map((type) => type.name).find(
    (type) => type === subject.split(":")[0].trim()
  );

  console.log(chalk.blue(`Tipo di commit selezionato: ${commitType}`));

  // Regex migliorata (gestisce più spazi dopo : e controlla meglio gli scope)
  const commitRegex = new RegExp(`^${commitType}(?:\\([^)]+\\))?:\\s+.+`);

  if (!commitRegex.test(subject)) {
    console.log(chalk.red("Formato Conventional Commit non valido. Esempio: 'feat: descrizione' o 'feat(scope): descrizione'"));
    return false;
  }

  return true;
}

async function main() {
  console.log(chalk.blue("🔧 Git Commit Helper CLI => ctrl+c: exit"));
  try {
    // Ottieni le differenze staged
    let diff = execSync("git diff --cached").toString();

    if (!diff) {
      console.log(chalk.yellow("Nessuna modifica staged per il commit"));

      const { confirmAdd } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirmAdd",
          message: "Procedere con il 'git add .'?",
          default: true,
        },
      ]);

      if (confirmAdd) {
        execSync(`git add .`, {
          stdio: "inherit",
        });
        console.log(chalk.green("✔️​ Add eseguito con successo!"));
        diff = execSync("git diff --cached").toString();
      } else {
        console.log(chalk.yellow("❌ Add annullato"));
        process.exit(0);
      }
    }

    // 1. Richiesta di review del codice
    const { wantReview } = await inquirer.prompt({
      type: "confirm",
      name: "wantReview",
      message: "Vuoi una review del codice da Gemini prima di procedere?",
      default: true,
    });
    
    if (wantReview) {
      console.log(chalk.blue("\n🔍 Analisi del codice in corso..."));
      const review = await askGeminiForReview(diff);

      if (review === null) {
        console.log(chalk.yellow("⚠️​ Impossibile ottenere una review"));
        process.exit(1);
      } 
      console.log(chalk.blue("\n🔍 Review ricevuta:"), review);
      const score = review.match(/Score:\s*(\d+)\/10/i);
      if (!score) {
        console.log(
          chalk.yellow(`⚠️​ Review non contiene un punteggio valido, ${score}`)
        );
        process.exit(1);
      }
      const scoreValue = parseInt(score[1], 10);
      if (scoreValue < MIN_REVIEW_SCORE) {
        console.log(
          chalk.red(
            `\n❌ Review score: ${scoreValue}/10 - Modifiche non sufficienti`
          )
        );
        const { proceedAnyway } = await inquirer.prompt({
          type: "confirm",
          name: "proceedAnyway",
          message: "Vuoi procedere comunque?",
          default: false,
        });
        if (!proceedAnyway) process.exit(1);
      } else {
        console.log(
          chalk.green(
            `\n✅ Review score: ${scoreValue}/10 - Modifiche approvate da Gemini!`
          )
        );
      }
    }

    let msgGemini = await askGeminiForGeneratedCommitMessage(diff);
    if (msgGemini === null) {
      console.log(
        chalk.yellow("⚠️​ Impossibile generare il messaggio di commit")
      );
      process.exit(1);
    }
    let commitMessage = msgGemini.replace(/```/g, "").replace(/\n/g, "");

    // 3. Controllo della lunghezza del messaggio
    const validationResult = validateMessage(
      commitMessage
    );
    if (!validationResult) {
      console.error(chalk.red(`❌ Errore di validazione`));
      const { fixMessage } = await inquirer.prompt({
        type: "confirm",
        name: "fixMessage",
        message: "Vuoi modificare il messaggio di commit?",
        default: true,
      });
      if (fixMessage) {
        const { newMessage } = await inquirer.prompt({
          type: "input",
          name: "newMessage",
          message: "Inserisci il nuovo messaggio di commit:",
          default: msg,
        });
        msg = newMessage;
      } else {
        console.log(chalk.yellow("❌ Commit annullato"));
        process.exit(1);
      }
    }

    // Mostra anteprima e chiedi conferma
    console.log(chalk.green("\nAnteprima messaggio di commit:"));
    console.log(chalk.cyan("---"));
    console.log(chalk.cyan(commitMessage));
    console.log(chalk.cyan("---"));

    const { confirmCommit } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmCommit",
        message: "Procedere con il commit?",
        default: true,
      },
    ]);

    if (confirmCommit) {
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
        stdio: "inherit",
      });
      console.log(chalk.green("✔️​ Commit creato con successo!"));
    } else {
      console.log(chalk.yellow("❌ Commit annullato"));
      process.exit(0);
    }

    const { confirmPush } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmPush",
        message: "Procedere con il push?",
        default: true,
      },
    ]);

    if (confirmPush) {
      execSync(`git push`, {
        stdio: "inherit",
      });
      console.log(chalk.green("✔️​ Push eseguito con successo!"));
    } else {
      console.log(chalk.yellow("❌ Push annullato"));
      process.exit(0);
    }
  } catch (error) {
    console.error(chalk.red("Errore:"), error.message);
    process.exit(1);
  }
}

main()
