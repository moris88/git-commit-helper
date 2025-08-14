# Git Commit Helper with AI

An intelligent CLI tool that leverages the power of multiple AI providers (Gemini, OpenAI, Ollama) to streamline your Git workflow. It helps you create flawless, Conventional-Commit-compliant commit messages, performs AI-powered code reviews, and ensures your codebase remains clean and consistent.

This tool is designed for developers who want to improve their productivity and maintain high-quality standards in their projects. It operates in both **English** and **Italian**, automatically detecting your system's language and translating AI responses when needed.


## ✨ Features

*   **🤖 Multi-AI Provider Support**: Seamlessly use **Google Gemini**, **OpenAI**, or a local **Ollama** instance. The tool automatically detects the configured provider.
*   **🌐 Automatic Translation**: AI-generated content (reviews, commit messages) is automatically translated into Italian if the system locale is set to Italian.
*   **🚀 Optimized Prompts**: Uses provider-specific prompts to ensure the highest quality responses, with special instructions for local models like CodeLlama to prevent formatting issues.
*   **🌿 AI-Powered Branch Naming**: Suggests a descriptive branch name based on your un-staged changes.
*   **🔍 AI-Powered Code Review**: Get an instant code review before committing, with a quality score and detailed feedback.
*   **✍️ AI-Powered Commit Generation**: Automatically generates a concise **subject** and a detailed **body** for your commit message.
*   **🛡️ Protected Branch Guard**: Prevents direct commits to critical branches (`main`, `master`, `dev`), guiding you to create a new feature branch.
*   **⚙️ Fully Configurable**: Customize prompts, models, and workflow rules through a simple `gch.config.json` file.
*   **훅 Pre-Commit Hooks**: Define custom shell commands (like `npm run lint` or `npm run test`) to run before the AI review.
*   **⚡ Single-Action Commands**: Execute specific tasks like creating a branch (`gch branch`), reviewing code (`gch review`), or generating a commit (`gch commit`) independently.
*   **👁️ Git Log & Graph Viewer**: Quickly view the last 5 commits (`gch log`) or a decorated branch graph (`gch adog`).
*   **🔄 Interactive Rebase & Checkout**: User-friendly commands (`gch rebase`, `gch checkout`) that let you select a branch from a list.
*   **↩️ Safe Commit Undo**: The `gch undo` command reverts the last local commit, but only if it hasn't been pushed.
*   **🤫 Non-Interactive Mode**: Use the `-y` or `--yes` flag to accept all suggestions automatically, perfect for scripting.
*   **🤝 Conventional Commits Standard**: Enforces the Conventional Commits specification to keep your commit history organized and readable.


## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   Git
*   An API Key for your chosen provider (Gemini or OpenAI) or a running Ollama instance.

### Installation

Install the package globally for easy access from any project:

```bash
npm install -g git-commit-helper-it
```

### Configuration

Before the first run, you need to create a configuration file. You can do this automatically by running the init script:

```bash
npx gch-init // local install
gch-init // global install
```

This will create a `gch.config.json` file in your project's root directory. To use a single configuration for all your projects, you can create a global file instead:

```bash
gch-init --global
```

Open the configuration file and add the keys for your desired AI provider. The tool will automatically use the first valid configuration it finds.

Here is a full example showing all available options:

```json
{
  // --- Provider Settings (add only one set of credentials) ---
  "geminiApiKey": "your-gemini-api-key",
  "geminiModel": "gemini-1.5-flash",

  "openaiApiKey": "your-openai-api-key",
  "openaiModel": "gpt-4o-mini",

  "ollamaModel": "codellama", // The name of the model pulled in Ollama

  // --- Workflow Settings ---
  "aiReviewEnabled": true,
  "defaultCommitType": "feat",
  "maxSubjectLength": 60,
  "minReviewScore": 6,
  "maxDiffLines": 3500,
  "preCommitCommands": [
    "npm run lint",
    "npm run build",
    "npm run test"
  ]
}
```


## Usage

The tool can be run in two main ways: as a full interactive workflow or as a single-action command.

### Full Workflow

To start the complete, step-by-step interactive process, simply run the main command:

```bash
npx gch // local install
gch // global install
```

The tool will guide you through the following steps:
1.  **Branch Check**: If you are on a protected branch, it suggests a new branch name.
2.  **File Staging**: Asks you which modified files to stage for the commit.
3.  **Pre-Commit Hooks**: Runs any configured pre-commit commands.
4.  **Code Review (Optional)**: Performs an AI-powered code review of your changes.
5.  **Commit Message Generation**: Generates a subject and, optionally, a detailed body for the commit message.
6.  **Commit Confirmation**: Shows you the final message and asks for confirmation.
7.  **Push Confirmation**: Asks if you want to push the changes to the remote repository.

For a fully automated run, use the `-y` or `--yes` flag:

```bash
npx gch -y // local install
gch -y // global install
```

### Single-Action Commands

You can also run specific parts of the workflow independently.

*   `gch branch`: Suggests and creates a new branch.
*   `gch review`: Stages files and performs an AI code review.
*   `gch commit`: Stages files and generates a commit message.
*   `gch push`: Stages, commits, and pushes the current branch.
*   `gch log`: Displays the last 5 commits.
*   `gch adog`: Displays a decorated graph of all branches.
*   `gch rebase`: Starts an interactive rebase process.
*   `gch undo`: Undoes the last local commit.
*   `gch checkout`: Starts an interactive process to switch branches.

The `-y` or `--yes` flag can be combined with any command to skip interactive prompts (e.g., `gch commit -y`).

---
---

# Git Commit Helper con AI (Italiano)

Uno strumento CLI intelligente che sfrutta la potenza di diversi provider AI (Gemini, OpenAI, Ollama) per ottimizzare il tuo flusso di lavoro Git. Ti aiuta a creare messaggi di commit impeccabili e conformi allo standard Conventional Commits, esegue revisioni del codice basate su AI e garantisce che la tua codebase rimanga pulita e coerente.

Questo strumento è pensato per gli sviluppatori che desiderano migliorare la propria produttività e mantenere standard di alta qualità nei loro progetti. Funziona sia in **inglese** che in **italiano**, rilevando automaticamente la lingua del sistema e traducendo le risposte dell'AI quando necessario.


## ✨ Funzionalità

*   **🤖 Supporto Multi-AI Provider**: Usa senza problemi **Google Gemini**, **OpenAI** o un'istanza locale di **Ollama**. Lo strumento rileva automaticamente il provider configurato.
*   **🌐 Traduzione Automatica**: Il contenuto generato dall'AI (revisioni, messaggi di commit) viene tradotto automaticamente in italiano se la lingua del sistema è impostata su italiano.
*   **🚀 Prompt Ottimizzati**: Utilizza prompt specifici per ogni provider per garantire la massima qualità delle risposte, con istruzioni speciali per modelli locali come CodeLlama per prevenire problemi di formattazione.
*   **🌿 Nomi Branch AI**: Suggerisce un nome di branch descrittivo basato sulle modifiche non ancora in staging.
*   **🔍 Code Review AI**: Ottieni una revisione istantanea del codice prima di committare, con un punteggio di qualità e un feedback dettagliato.
*   **✍️ Generazione Commit AI**: Genera automaticamente un **soggetto** conciso e un **corpo** dettagliato per il tuo messaggio di commit.
*   **🛡️ Protezione Branch Critici**: Impedisce commit diretti su branch critici (`main`, `master`, `dev`), guidandoti nella creazione di un nuovo feature branch.
*   **⚙️ Completamente Configurabile**: Personalizza prompt, modelli e regole del flusso di lavoro tramite un semplice file `gch.config.json`.
*   **훅 Hook Pre-Commit**: Definisci comandi shell personalizzati (come `npm run lint` o `npm run test`) da eseguire prima della revisione AI.
*   **⚡ Comandi Singoli**: Esegui operazioni specifiche in modo indipendente, come la creazione di un branch (`gch branch`), la revisione del codice (`gch review`) o la generazione di un commit (`gch commit`).
*   **👁️ Visualizzatore Log e Grafico Git**: Visualizza rapidamente gli ultimi 5 commit (`gch log`) o un grafico decorato dei branch (`gch adog`).
*   **🔄 Rebase e Checkout Interattivi**: Comandi intuitivi (`gch rebase`, `gch checkout`) che ti permettono di selezionare un branch da un elenco.
*   **↩️ Annullamento Sicuro del Commit**: Il comando `gch undo` annulla l'ultimo commit locale, ma solo se non è stato ancora pushato.
*   **🤫 Modalità Non Interattiva**: Usa il flag `-y` o `--yes` per accettare automaticamente tutti i suggerimenti, ideale per gli script.
*   **🤝 Standard Conventional Commits**: Impone la specifica Conventional Commits per mantenere la cronologia dei commit organizzata e leggibile.


## 🚀 Come Iniziare

### Prerequisiti

*   Node.js (v18 o superiore)
*   Git
*   Una API Key per il provider scelto (Gemini o OpenAI) o un'istanza di Ollama in esecuzione.

### Installazione

Installa il pacchetto globalmente per un accesso semplice da qualsiasi progetto:

```bash
npm install -g git-commit-helper-it
```

### Configurazione

Prima del primo utilizzo, devi creare un file di configurazione. Puoi farlo automaticamente eseguendo lo script di inizializzazione:

```bash
npx gch-init // installazione locale
gch-init // installazione globale
```

Questo creerà un file `gch.config.json` nella directory principale del tuo progetto. Per usare una singola configurazione per tutti i tuoi progetti, puoi creare un file globale:

```bash
gch-init --global
```

Apri il file di configurazione e aggiungi le chiavi per il provider AI che desideri utilizzare. Lo strumento utilizzerà automaticamente la prima configurazione valida che trova.

Ecco un esempio completo che mostra tutte le opzioni disponibili:

```json
{
  // --- Impostazioni Provider (aggiungi solo un set di credenziali) ---
  "geminiApiKey": "la-tua-api-key-gemini",
  "geminiModel": "gemini-1.5-flash",

  "openaiApiKey": "la-tua-api-key-openai",
  "openaiModel": "gpt-4o-mini",

  "ollamaModel": "codellama", // Il nome del modello scaricato in Ollama

  // --- Impostazioni Flusso di Lavoro ---
  "aiReviewEnabled": true,
  "defaultCommitType": "feat",
  "maxSubjectLength": 60,
  "minReviewScore": 6,
  "maxDiffLines": 3500,
  "preCommitCommands": [
    "npm run lint",
    "npm run test"
  ]
}
```


## Utilizzo

Lo strumento può essere utilizzato in due modi principali: come un flusso di lavoro interattivo completo o come un comando per una singola operazione.

### Flusso di Lavoro Completo

Per avviare il processo interattivo completo, esegui semplicemente il comando principale:

```bash
npx gch // installazione locale
gch // installazione globale
```

Lo strumento ti guiderà attraverso i seguenti passaggi:
1.  **Controllo Branch**: Se ti trovi su un branch protetto, suggerisce un nuovo nome per il branch.
2.  **Staging dei File**: Ti chiede quali file modificati mettere in staging per il commit.
3.  **Hook Pre-Commit**: Esegue i comandi di pre-commit configurati.
4.  **Code Review (Opzionale)**: Esegue una revisione del codice delle tue modifiche tramite AI.
5.  **Generazione Messaggio di Commit**: Genera un soggetto e, opzionalmente, un corpo dettagliato per il messaggio.
6.  **Conferma Commit**: Ti mostra il messaggio finale e chiede conferma.
7.  **Conferma Push**: Ti chiede se desideri inviare le modifiche al repository remoto.

Per un'esecuzione completamente automatizzata, usa il flag `-y` o `--yes`:

```bash
npx gch -y // installazione locale
gch -y // installazione globale
```

### Comandi per Operazione Singola

Puoi anche eseguire parti specifiche del flusso di lavoro in modo indipendente.

*   `gch branch`: Suggerisce e crea un nuovo branch.
*   `gch review`: Esegue lo staging dei file ed esegue una code review AI.
*   `gch commit`: Esegue lo staging dei file e genera un messaggio di commit.
*   `gch push`: Esegue staging, commit e push del branch corrente.
*   `gch log`: Visualizza gli ultimi 5 commit.
*   `gch adog`: Visualizza un grafico decorato di tutti i branch.
*   `gch rebase`: Avvia un processo di rebase interattivo.
*   `gch undo`: Annulla l'ultimo commit locale.
*   `gch checkout`: Avvia un processo interattivo per cambiare branch.

Il flag `-y` o `--yes` può essere combinato con qualsiasi comando per saltare le richieste interattive (es. `gch commit -y`).
