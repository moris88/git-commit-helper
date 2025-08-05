# Git Commit Helper with Gemini AI

An intelligent CLI tool that leverages the power of Google's Gemini AI to streamline your Git workflow. It helps you create flawless, Conventional-Commit-compliant commit messages, performs AI-powered code reviews, and ensures your codebase remains clean and consistent.

This tool is designed for developers who want to improve their productivity and maintain high-quality standards in their projects. It operates in both **English** and **Italian**, automatically detecting your system's language.


## ✨ Features

* **🤖 AI-Powered Commit Generation**: Automatically generates a concise **subject** and a detailed **body** for your commit message based on staged changes.
* **🌿 AI-Powered Branch Naming**: Before suggesting a new branch name, it displays a list of existing branches.
* **🔍 AI-Powered Code Review**: Get an instant code review from Gemini AI before committing, with a quality score and detailed feedback.
* **Interactive Rebase & Checkout**: User-friendly commands (`rebase`, `checkout`) that let you select a branch from a list.
* **Safe Commit Undo**: The `undo` command reverts the last local commit, but only if it hasn't been pushed.
* **Single-Action Commands**: Execute specific tasks like creating a branch (`--branch`), reviewing code (`--review`), or generating a commit (`--commit`) independently.
* **Git Log & Graph Viewer**: Quickly view the last 5 commits (`--log`) or a decorated branch graph (`adog`).
* **Non-Interactive Mode**: Use the `-y` or `--yes` flag to accept all suggestions automatically, perfect for scripting or quick commits.
* **Pre-Commit Hooks**: Define custom shell commands (like `npm run lint` or `npm test`) to run before the AI review. If any command fails, the commit is aborted.
* **🌐 Multi-language Support**: The user interface is available in both English and Italian, with automatic language detection.
* **🤝 Conventional Commits Standard**: Enforces the Conventional Commits specification to keep your commit history organized and readable.
* **⚙️ Fully Configurable**: Customize prompts, models, and workflow rules through a simple `gch.config.json` file.
* **Protected Branch Guard**: Prevents direct commits to critical branches like `main` or `master`, guiding you to create a new feature branch.


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
gch-init
```

This will create a `gch.config.json` file in your project's root directory. To use a single configuration for all your projects, you can create a global file instead:

```bash
gch-init --global
```

Open the configuration file and add your Gemini API key. Here is a full example of the available options:

```json
{
  "geminiApiKey": "your-api-key-here",
  "geminiModel": "gemini-1.5-flash",
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


## Usage

The tool can be run in two main ways: as a full interactive workflow or as a single-action command.

### Full Workflow

To start the complete, step-by-step interactive process, simply run the main command:

```bash
gch
```

The tool will guide you through the following steps:
1. **Branch Check**: If you are on a protected branch, it displays the list of local branches and suggests a new branch name.
2. **File Staging**: Asks you which modified files to stage for the commit.
3. **Pre-Commit Hooks**: Runs any configured pre-commit commands.
4. **Code Review (Optional)**: Performs an AI-powered code review of your changes.
5. **Commit Message Generation**: Generates a subject and, optionally, a detailed body for the commit message.
6. **Commit Confirmation**: Shows you the final message and asks for confirmation.
7. **Push Confirmation**: Asks if you want to push the changes to the remote repository.

For a fully automated run, use the `-y` or `--yes` flag:

```bash
gch -y
```

### Single-Action Commands

You can also run specific parts of the workflow independently. The commands are sequential: `push` includes `commit`, and `commit` includes `review`.

*   `gch --branch`
    Suggests and creates a new branch. This command is independent.

*   `gch --review`
    **Stages files** and performs an AI code review.

*   `gch --commit`
    **Stages files** and generates a commit message.

*   `gch --push`
    **Stages files**, **generates a commit**, and then pushes the current branch to the remote.

*   `gch --log`
    Displays the last 5 commits.

*   `gch adog`
    Displays a decorated graph of all branches.

*   `gch rebase`
    Starts an interactive rebase process, allowing you to select a branch to rebase onto.

*   `gch undo`
    Undoes the last local commit, moving the changes back to the working directory. Fails safely if the commit has been pushed.

*   `gch checkout`
    Starts an interactive process to switch to another local branch.

The `-y` or `--yes` flag can be combined with any command to skip interactive prompts, for example:
`gch --commit -y`


# Git Commit Helper con Gemini AI (Italiano)

Uno strumento CLI intelligente che sfrutta la potenza di Gemini AI di Google per ottimizzare il tuo flusso di lavoro Git. Ti aiuta a creare messaggi di commit impeccabili e conformi allo standard Conventional Commits, esegue revisioni del codice basate su AI e garantisce che la tua codebase rimanga pulita e coerente.

Questo strumento è pensato per gli sviluppatori che desiderano migliorare la propria produttività e mantenere standard di alta qualità nei loro progetti. Funziona sia in **inglese** che in **italiano**, rilevando automaticamente la lingua del sistema.


## ✨ Funzionalità

* **🤖 Generazione Commit AI**: Genera automaticamente un **soggetto** conciso e un **corpo** dettagliato per il tuo messaggio di commit, basandosi sulle modifiche in staging.
* **🌿 Nomi Branch AI**: Prima di suggerire un nuovo nome per il branch, visualizza un elenco dei branch esistenti.
* **🔍 Code Review AI**: Ottieni una revisione istantanea del codice da Gemini AI prima di committare, con un punteggio di qualità e un feedback dettagliato.
* **Rebase e Checkout Interattivi**: Comandi intuitivi (`rebase`, `checkout`) che ti permettono di selezionare un branch da un elenco.
* **Annullamento Sicuro del Commit**: Il comando `undo` annulla l'ultimo commit locale, ma solo se non è stato ancora pushato.
* **Comandi Singoli**: Esegui operazioni specifiche in modo indipendente, come la creazione di un branch (`--branch`), la revisione del codice (`--review`) o la generazione di un commit (`--commit`).
* **Visualizzatore Log e Grafico Git**: Visualizza rapidamente gli ultimi 5 commit (`--log`) o un grafico decorato dei branch (`adog`).
* **Modalità Non Interattiva**: Usa il flag `-y` o `--yes` per accettare automaticamente tutti i suggerimenti, ideale per script o commit veloci.
* **Hook Pre-Commit**: Definisci comandi shell personalizzati (come `npm run lint` o `npm test`) da eseguire prima della revisione AI. Se un comando fallisce, il commit viene annullato.
* **🌐 Supporto Multilingua**: L'interfaccia utente è disponibile sia in inglese che in italiano, con rilevamento automatico della lingua.
* **🤝 Standard Conventional Commits**: Impone la specifica Conventional Commits per mantenere la cronologia dei commit organizzata e leggibile.
* **⚙️ Completamente Configurabile**: Personalizza prompt, modelli e regole del flusso di lavoro tramite un semplice file `gch.config.json`.
* **Protezione Branch Critici**: Impedisce commit diretti su branch critici come `main` o `master`, guidandoti nella creazione di un nuovo feature branch.


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
gch-init
```

Questo creerà un file `gch.config.json` nella directory principale del tuo progetto. Per usare una singola configurazione per tutti i tuoi progetti, puoi creare un file globale:

```bash
gch-init --global
```

Apri il file di configurazione e aggiungi la tua API key di Gemini. Ecco un esempio completo delle opzioni disponibili:

```json
{
  "geminiApiKey": "la-tua-api-key-qui",
  "geminiModel": "gemini-1.5-flash",
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
gch
```

Lo strumento ti guiderà attraverso i seguenti passaggi:
1. **Controllo Branch**: Se ti trovi su un branch protetto, visualizza l'elenco dei branch locali e suggerisce un nuovo nome per il branch.
2. **Staging dei File**: Ti chiede quali file modificati mettere in staging per il commit.
3. **Hook Pre-Commit**: Esegue i comandi di pre-commit configurati.
4. **Code Review (Opzionale)**: Esegue una revisione del codice delle tue modifiche tramite AI.
5. **Generazione Messaggio di Commit**: Genera un soggetto e, opzionalmente, un corpo dettagliato per il messaggio.
6. **Conferma Commit**: Ti mostra il messaggio finale e chiede conferma.
7. **Conferma Push**: Ti chiede se desideri inviare le modifiche al repository remoto.

Per un'esecuzione completamente automatizzata, usa il flag `-y` o `--yes`:

```bash
gch -y
```

### Comandi per Operazione Singola

Puoi anche eseguire parti specifiche del flusso di lavoro in modo indipendente. I comandi sono sequenziali: `push` include `commit`, e `commit` include `review`.

*   `gch --branch`
    Suggerisce e crea un nuovo branch. Questo comando è indipendente.

*   `gch --review`
    **Esegue lo staging dei file** ed esegue una code review AI.

*   `gch --commit`
    **Esegue lo staging dei file** e genera un messaggio di commit.

*   `gch --push`
    **Esegue lo staging dei file**, **genera un commit** e infine esegue il push del branch corrente sul repository remoto.

*   `gch --log`
    Visualizza gli ultimi 5 commit.

*   `gch adog`
    Visualizza un grafico decorato di tutti i branch.

*   `gch rebase`
    Avvia un processo di rebase interattivo, permettendoti di selezionare un branch su cui eseguire il rebase.

*   `gch undo`
    Annulla l'ultimo commit locale, spostando le modifiche nella directory di lavoro. Fallisce in modo sicuro se il commit è già stato pushato.

*   `gch checkout`
    Avvia un processo interattivo per spostarsi su un altro branch locale.

The `-y` or `--yes` flag can be combined with any command to skip interactive prompts, for example:
`gch --commit -y`