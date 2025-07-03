# Git Commit Helper with Gemini AI

Uno strumento CLI per generare messaggi di commit perfetti usando l'AI di Gemini, direttamente dal tuo terminale.

## 📦 Installazione

### Prerequisiti

- Node.js 18+
- Git
- API Key di Gemini ([ottienila qui](https://ai.google.dev/))

### Installa globalmente

```bash
npm install -g git-commit-helper
```

## Utilizzo nella tua repository

1. Nella root del tuo progetto, crea una configurazione locale (opzionale):

```bash
mkdir .git-commit-helper
echo '{
  "geminiApiKey": "la-tua-api-key",
  "defaultCommitType": "feat",
  "maxSubjectLength": 50
}' > .git-commit-helper/gch.config.json
```

2. Usa normalmente:

```bash
git add .
gch
```
