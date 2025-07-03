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
  // 1. Cerca nella repository corrente
  const localConfigPath = resolve(
    process.cwd(),
    ".git-commit-helper",
    "gch.config.json"
  );
  // 2. Cerca nella home dell'utente (fallback)
  const globalConfigPath = join(
    homedir(),
    ".git-commit-helper",
    "gch.config.json"
  );

  if (existsSync(localConfigPath)) {
    console.log("Usando configurazione locale del progetto");
    return JSON.parse(readFileSync(localConfigPath, "utf-8"));
  }

  if (existsSync(globalConfigPath)) {
    console.log("Usando configurazione globale");
    return JSON.parse(readFileSync(globalConfigPath, "utf-8"));
  }

  throw new Error(
    "File di configurazione non trovato. Crea .git-commit-helper/config.json nella tua repository o nella home globale dell'utente."
  );
}

// Esempio di uso
const config = loadConfig();

if (!config.geminiApiKey) {
  console.error(
    chalk.red("API key non configurata."),
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
];

async function generateCommitMessage() {
  try {
    // Ottieni le differenze staged
    const diff = execSync("git diff --cached").toString();

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
    const { commitType, isBreakingChange } = await inquirer.prompt([
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
      },
      {
        type: "confirm",
        name: "isBreakingChange",
        message: "Contiene cambiamenti che rompono la compatibilità?",
        default: false,
      },
    ]);

    // Genera prompt per Gemini
    const prompt = `Genera un messaggio di commit seguendo le Conventional Commits per queste modifiche:
Tipo: ${commitType}
${isBreakingChange ? "BREAKING CHANGE: si" : ""}

Regole:
- Riga soggetto: massimo ${config.maxSubjectLength} caratteri
- Usa il formato: <tipo>(<ambito>): <descrizione>
- Descrizione concisa all'infinito
- Corpo opzionale dopo riga vuota (se necessario)
- Footer per breaking changes (se presenti)

Diff: ${diff.substring(0, 3000)}`;
    console.log(chalk.blue("Prompt inviato a Gemini"));
    console.log(chalk.blue("Attendo la risposta..."));
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
    console.log(chalk.blue("Risposta da Gemini: "), response);
    let commitMessage = response.candidates[0].content.parts[0].text;

    // 3. Controllo della lunghezza del messaggio
    const validateMessage = (msg) => {
      const lines = msg.split("\n");
      const subject = lines[0].trim(); // Trim per sicurezza

      // Verifica lunghezza soggetto
      if (subject.length > config.maxSubjectLength) {
        return `La riga soggetto supera ${config.maxSubjectLength} caratteri (${subject.length})`;
      }

      // Regex migliorata (gestisce più spazi dopo : e controlla meglio gli scope)
      const commitRegex = new RegExp(
        `^${commitType}(?:\\([^)]+\\))?:\\s+.+`,
        "s" // Flag 's' per gestire eventuali . che includono newline
      );

      if (!commitRegex.test(subject)) {
        return "Formato Conventional Commit non valido. Esempio: 'feat: descrizione' o 'feat(scope): descrizione'";
      }

      return true;
    };

    // Aggiungi BREAKING CHANGE se necessario
    if (isBreakingChange && !commitMessage.includes("BREAKING CHANGE:")) {
      commitMessage += "\n\nBREAKING CHANGE: ";
      const { breakingChangeDesc } = await inquirer.prompt([
        {
          type: "input",
          name: "breakingChangeDesc",
          message: "Descrivi il breaking change:",
        },
      ]);
      commitMessage += breakingChangeDesc;
    }

    // Mostra anteprima e chiedi conferma
    console.log(chalk.green("\nAnteprima messaggio di commit:"));
    console.log(chalk.cyan("---"));
    console.log(chalk.cyan(commitMessage));
    console.log(chalk.cyan("---"));

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Procedere con il commit?",
        default: true,
      },
    ]);

    if (confirm) {
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
        stdio: "inherit",
      });
      console.log(chalk.green("✔ Commit creato con successo!"));
    } else {
      console.log(chalk.yellow("✖ Commit annullato"));
    }
  } catch (error) {
    console.error(chalk.red("Errore:"), error.message);
    process.exit(1);
  }
}

generateCommitMessage();
