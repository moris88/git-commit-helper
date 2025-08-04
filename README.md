# Git Commit Helper with Gemini AI

An intelligent CLI tool that leverages the power of Google's Gemini AI to streamline your Git workflow. It helps you create flawless, Conventional-Commit-compliant commit messages, performs AI-powered code reviews, and ensures your codebase remains clean and consistent.

This tool is designed for developers who want to improve their productivity and maintain high-quality standards in their projects. It operates in both **English** and **Italian**, automatically detecting your system's language.


---

## ✨ Features

* **🤖 AI-Powered Commit Generation**: Automatically generates a concise **subject** and a detailed **body** for your commit message based on staged changes.
* **🌿 AI-Powered Branch Naming**: Suggests a descriptive branch name (e.g., `feat/new-auth-flow`) when you're on a protected branch, ensuring consistent naming conventions.
* **🔍 AI-Powered Code Review**: Get an instant code review from Gemini AI before committing, with a quality score and detailed feedback.
* **-y Non-Interactive Mode**: Use the `-y` or `--yes` flag to accept all suggestions automatically, perfect for scripting or quick commits.
* **-b Pre-Commit Hooks**: Define custom shell commands (like `npm run lint` or `npm test`) to run before the AI review. If any command fails, the commit is aborted.
* **🌐 Multi-language Support**: The user interface is available in both English and Italian, with automatic language detection.
* **🤝 Conventional Commits Standard**: Enforces the Conventional Commits specification to keep your commit history organized and readable.
* **⚙️ Fully Configurable**: Customize prompts, models, and workflow rules through a simple `gch.config.json` file.
* **-b Protected Branch Guard**: Prevents direct commits to critical branches like `main` or `master`, guiding you to create a new feature branch.


---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* Git
* A Google Gemini API Key ([get one here](https://ai.google.dev/))

### Installation

Install the package globally for easy access from any project:

```bash
npm install -g git-commit-helper-it
```

### Configuration

Before the first run, you need to create a configuration file. You can do this automatically by running the init script:

```bash
npx gch-init
```

This will create a `gch.config.json` file in your project's root directory. To use a single configuration for all your projects, you can create a global file instead:

```bash
npx gch-init --global
```

Open the configuration file and add your Gemini API key. Here is a full example of the available options:

```json
{
  "geminiApiKey": "your-api-key-here",
  "geminiModel": "gemini-1.5-flash",
  "aiReviewEnabled": true,
  "defaultCommitType": "feat",
  "maxSubjectLength": 50,
  "minReviewScore": 6,
  "maxDiffLines": 500,
  "preCommitCommands": [
    "npm run lint",
    "npm run test"
  ]
}
```


---

## Usage

To start the interactive commit process, simply run the main command from your project's root directory:

```bash
npx gch
```

For a fully automated run, use the `-y` or `--yes` flag:

```bash
npx gch -y
```

The tool will guide you through the following steps:


1. **Branch Check**: If you are on a protected branch, it suggests a new branch name.
2. **File Staging**: Asks you which modified files to stage for the commit.
3. **Pre-Commit Hooks**: Runs any configured pre-commit commands.
4. **Code Review (Optional)**: Performs an AI-powered code review of your changes.
5. **Commit Message Generation**: Generates a subject and, optionally, a detailed body for the commit message.
6. **Commit Confirmation**: Shows you the final message and asks for confirmation.
7. **Push Confirmation**: Asks if you want to push the changes to the remote repository.


---

# Git Commit Helper con Gemini AI (Italiano)

Uno strumento CLI intelligente che sfrutta la potenza di Gemini AI di Google per ottimizzare il tuo flusso di lavoro Git. Ti aiuta a creare messaggi di commit impeccabili e conformi allo standard Conventional Commits, esegue revisioni del codice basate su AI e garantisce che la tua codebase rimanga pulita e coerente.

Questo strumento è pensato per gli sviluppatori che desiderano migliorare la propria produttività e mantenere standard di alta qualità nei loro progetti. Funziona sia in **inglese** che in **italiano**, rilevando automaticamente la lingua del sistema.


---

## ✨ Funzionalità

* **🤖 Generazione Commit AI**: Genera automaticamente un **soggetto** conciso e un **corpo** dettagliato per il tuo messaggio di commit, basandosi sulle modifiche in staging.
* **🌿 Nomi Branch AI**: Suggerisce un nome di branch descrittivo (es. `feat/new-auth-flow`) quando ti trovi su un branch protetto, garantendo coerenza.
* **🔍 Code Review AI**: Ottieni una revisione istantanea del codice da Gemini AI prima di committare, con un punteggio di qualità e un feedback dettagliato.
* **-y Modalità Non Interattiva**: Usa il flag `-y` o `--yes` per accettare automaticamente tutti i suggerimenti, ideale per script o commit veloci.
* **-b Hook Pre-Commit**: Definisci comandi shell personalizzati (come `npm run lint` o `npm test`) da eseguire prima della revisione AI. Se un comando fallisce, il commit viene annullato.
* **🌐 Supporto Multilingua**: L'interfaccia utente è disponibile sia in inglese che in italiano, con rilevamento automatico della lingua.
* **🤝 Standard Conventional Commits**: Impone la specifica Conventional Commits per mantenere la cronologia dei commit organizzata e leggibile.
* **⚙️ Completamente Configurabile**: Personalizza prompt, modelli e regole del flusso di lavoro tramite un semplice file `gch.config.json`.
* **-b Protezione Branch Critici**: Impedisce commit diretti su branch critici come `main` o `master`, guidandoti nella creazione di un nuovo feature branch.


---

## 🚀 Come Iniziare

### Prerequisiti

* Node.js (v18 o superiore)
* Git
* Una API Key di Google Gemini ([ottienila qui](https://ai.google.dev/))

### Installazione

Installa il pacchetto globalmente per un accesso semplice da qualsiasi progetto:

```bash
npm install -g git-commit-helper-it
```

### Configurazione

Prima del primo utilizzo, devi creare un file di configurazione. Puoi farlo automaticamente eseguendo lo script di inizializzazione:

```bash
npx gch-init
```

Questo creerà un file `gch.config.json` nella directory principale del tuo progetto. Per usare una singola configurazione per tutti i tuoi progetti, puoi creare un file globale:

```bash
npx gch-init --global
```

Apri il file di configurazione e aggiungi la tua API key di Gemini. Ecco un esempio completo delle opzioni disponibili:

```json
{
  "geminiApiKey": "la-tua-api-key-qui",
  "geminiModel": "gemini-1.5-flash",
  "aiReviewEnabled": true,
  "defaultCommitType": "feat",
  "maxSubjectLength": 50,
  "minReviewScore": 6,
  "maxDiffLines": 500,
  "preCommitCommands": [
    "npm run lint",
    "npm run test"
  ]
}
```


---

## Utilizzo

Per avviare il processo di commit interattivo, esegui semplicemente il comando principale dalla root del tuo progetto:

```bash
npx gch
```

Per un'esecuzione completamente automatizzata, usa il flag `-y` o `--yes`:

```bash
npx gch -y
```

Lo strumento ti guiderà attraverso i seguenti passaggi:


1. **Controllo Branch**: Se ti trovi su un branch protetto, suggerisce un nuovo nome per il branch.
2. **Staging dei File**: Ti chiede quali file modificati mettere in staging per il commit.
3. **Hook Pre-Commit**: Esegue i comandi di pre-commit configurati.
4. **Code Review (Opzionale)**: Esegue una revisione del codice delle tue modifiche tramite AI.
5. **Generazione Messaggio di Commit**: Genera un soggetto e, opzionalmente, un corpo dettagliato per il messaggio.
6. **Conferma Commit**: Ti mostra il messaggio finale e chiede conferma.
7. **Conferma Push**: Ti chiede se desideri inviare le modifiche al repository remoto.


