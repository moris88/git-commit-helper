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
echo '{
  "geminiApiKey": "la-tua-api-key",
  "defaultCommitType": "feat",
  "maxSubjectLength": 50
}' > ./gch.config.json
```

2. Nella cartella globale:

```bash
echo '{
  "geminiApiKey": "la-tua-api-key",
  "defaultCommitType": "feat",
  "maxSubjectLength": 50
}' > C:/Users/<username>/.git-commit-helper/gch.config.json
```

## Uso

```bash
gch
```

## Pubblicazione NPM

Per pubblicare il pacchetto su NPM, assicurati di avere un account NPM e di essere autenticato. Poi esegui:

```bash
npm login
npm publish --access public
```

Per pubblicare in locale solo per testare:

```bash
npm link
```
