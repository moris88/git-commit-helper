# Git Commit Helper with Gemini AI

An intelligent CLI tool that leverages the power of Google's Gemini AI to streamline your Git workflow. It helps you create flawless, Conventional-Commit-compliant commit messages, performs AI-powered code reviews, and ensures your codebase remains clean and consistent.

This tool is designed for developers who want to improve their productivity and maintain high-quality standards in their projects. It operates in both **English** and **Italian**, automatically detecting your system's language.

---

## ✨ Features

- **🤖 AI-Powered Commit Messages**: Automatically generates concise and descriptive commit messages in English based on your staged changes.
- **🔍 AI-Powered Code Review**: Get an instant code review from Gemini AI before committing, with a quality score and detailed feedback.
- **🌐 Multi-language Support**: The user interface is available in both English and Italian, with automatic language detection.
- **🤝 Conventional Commits Standard**: Enforces the Conventional Commits specification to keep your commit history organized and readable.
- **⚙️ Simple Configuration**: Configure the tool with a simple `gch.config.json` file in your project root.
- **-b Interactive Staging**: Interactively select which modified files you want to include in your commit.
- **-b Protected Branch Guard**: Prevents direct commits to critical branches like `main` or `master`, prompting you to create a new branch.
- **📂 Handles Complex File Paths**: Works seamlessly with file names containing spaces or special characters.
- **📏 Diff Size Limit**: Prevents commits that exceed a configurable line count, encouraging smaller, atomic changes.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Git
- A Google Gemini API Key ([get one here](https://ai.google.dev/))

### Installation

Install the package as a development dependency in your project:

```bash
npm install --save-dev git-commit-helper-it
```

You can also install it globally for easier access:

```bash
or globally:

```bash
npm install -g git-commit-helper-it
```

### Configuration

Before the first run, you need to create a configuration file. You can do this automatically by running the init script:

```bash
npx gch-init
```

This will create a `gch.config.json` file in your project's root directory.
Or, you can create a global configuration file:

```bash
npx gch-init --global
```

The `--global` flag will create the configuration file in your home directory, making it available for all projects.

Open it and add your Gemini API key:

```json
{
  "geminiApiKey": "your-api-key-here",
  "geminiModel": "gemini-2.5-flash",
  "defaultCommitType": "feat",
  "maxSubjectLength": 50,
  "minReviewScore": 6,
  "maxDiffLines": 500
}
```

---

## Usage

To start the interactive commit process, simply run the main command from your project's root directory:

```bash
npx gch
```

The tool will guide you through the following steps:

1. **Branch Check**: Verifies you are not on a protected branch.
2. **File Staging**: Asks you which modified files to stage for the commit.
3. **Code Review (Optional)**: Performs an AI-powered code review of your changes.
4. **Commit Message Generation**: Generates a commit message.
5. **Commit Confirmation**: Shows you the final message and asks for confirmation before committing.
6. **Push Confirmation**: Asks if you want to push the changes to the remote repository.

---

---

# Git Commit Helper con Gemini AI (Italiano)

Uno strumento CLI intelligente che sfrutta la potenza di Gemini AI di Google per ottimizzare il tuo flusso di lavoro Git. Ti aiuta a creare messaggi di commit impeccabili e conformi allo standard Conventional Commits, esegue revisioni del codice basate su AI e garantisce che la tua codebase rimanga pulita e coerente.

Questo strumento è pensato per gli sviluppatori che desiderano migliorare la propria produttività e mantenere standard di alta qualità nei loro progetti. Funziona sia in **inglese** che in **italiano**, rilevando automaticamente la lingua del sistema.

---

## ✨ Funzionalità

- **🤖 Messaggi di Commit AI**: Genera automaticamente messaggi di commit concisi e descrittivi in inglese, basandosi sulle modifiche in staging.
- **🔍 Code Review AI**: Ottieni una revisione istantanea del codice da Gemini AI prima di committare, con un punteggio di qualità e un feedback dettagliato.
- **🌐 Supporto Multilingua**: L'interfaccia utente è disponibile sia in inglese che in italiano, con rilevamento automatico della lingua.
- **🤝 Standard Conventional Commits**: Impone la specifica Conventional Commits per mantenere la cronologia dei commit organizzata e leggibile.
- **⚙️ Configurazione Semplice**: Configura lo strumento con un semplice file `gch.config.json` nella root del tuo progetto.
- **-b Staging Interattivo**: Seleziona in modo interattivo quali file modificati includere nel commit.
- **-b Protezione Branch Critici**: Impedisce commit diretti su branch critici come `main` o `master`, invitandoti a creare un nuovo branch.
- **📂 Gestione Nomi File Complessi**: Funziona senza problemi con nomi di file che contengono spazi o caratteri speciali.
- **📏 Limite Dimensione Diff**: Impedisce commit che superano un numero di righe configurabile, incoraggiando modifiche più piccole e atomiche.

---

## 🚀 Come Iniziare

### Prerequisiti

- Node.js (v18 o superiore)
- Git
- Una API Key di Google Gemini ([ottienila qui](https://ai.google.dev/))

### Installazione

Installa il pacchetto come dipendenza di sviluppo nel tuo progetto:

```bash
npm install --save-dev git-commit-helper-it
```

Puoi anche installarlo globalmente per un accesso più semplice:

```bash
npm install -g git-commit-helper-it
```

### Configurazione

Prima del primo utilizzo, devi creare un file di configurazione. Puoi farlo automaticamente eseguendo lo script di inizializzazione:

```bash
npx gch-init
```

Questo creerà un file `gch.config.json` nella directory principale del tuo progetto.
Oppure, puoi creare globalmente il file di configurazione:

```bash
npx gch-init --global
```

Il comando `--global` creerà il file di configurazione nella tua home directory, rendendolo disponibile per tutti i progetti.

Aprilo e aggiungi la tua API key di Gemini:

```json
{
  "geminiApiKey": "la-tua-api-key-qui",
  "geminiModel": "gemini-2.5-flash",
  "defaultCommitType": "feat",
  "maxSubjectLength": 50,
  "minReviewScore": 6,
  "maxDiffLines": 500
}
```

---

## Utilizzo

Per avviare il processo di commit interattivo, esegui semplicemente il comando principale dalla root del tuo progetto:

```bash
npx gch
```

Lo strumento ti guiderà attraverso i seguenti passaggi:

1. **Controllo Branch**: Verifica che non ti trovi su un branch protetto.
2. **Staging dei File**: Ti chiede quali file modificati mettere in staging per il commit.
3. **Code Review (Opzionale)**: Esegue una revisione del codice delle tue modifiche tramite AI.
4. **Generazione Messaggio di Commit**: Genera un messaggio di commit.
5. **Conferma Commit**: Ti mostra il messaggio finale e chiede conferma prima di creare il commit.
6. **Conferma Push**: Ti chiede se desideri inviare le modifiche al repository remoto.
