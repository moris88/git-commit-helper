# Git Commit Helper con Gemini AI

Uno strumento CLI per generare messaggi di commit perfetti usando l'AI di Gemini, direttamente dal tuo terminale.

## 📦 Installazione

### Prerequisiti

- Node.js 18+
- Git
- API Key di Gemini ([ottienila qui](https://ai.google.dev/))

### Installa

```bash
npm install -D git-commit-helper-it
```

## Utilizzo nella tua repository

Nella root del tuo progetto, crea una configurazione:

```bash
echo '{
  "geminiApiKey": "la-tua-api-key",
  "defaultCommitType": "feat",
  "maxSubjectLength": 50
}' > ./gch.config.json
```

## Uso

```bash
npx gch
```
