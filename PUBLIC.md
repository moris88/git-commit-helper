# NPM Publishing Guide

This document provides the necessary commands to publish the `git-commit-helper` package to the NPM registry.

## Publishing NPM Package

### 1. Log in to NPM

First, you need to authenticate with your NPM account. Run the following command and enter your credentials:

```bash
npm login
```

### 2. Publish the Package

Once logged in, you can publish the package. The `--access public` flag is required for public packages.

```bash
npm publish --access public
```

### Local Testing

To test the package locally without publishing, you can create a symbolic link. This makes the command available globally on your machine.

```bash
npm link
```

---
---

# Guida alla Pubblicazione NPM (Italiano)

Questo documento fornisce i comandi necessari per pubblicare il pacchetto `git-commit-helper` sul registro NPM.

## Pubblicare Pacchetto NPM

### 1. Accedi a NPM

Per prima cosa, devi autenticarti con il tuo account NPM. Esegui il seguente comando e inserisci le tue credenziali:

```bash
npm login
```

### 2. Pubblica il Pacchetto

Una volta autenticato, puoi pubblicare il pacchetto. Il flag `--access public` è necessario per i pacchetti pubblici.

```bash
npm publish --access public
```

### Test in Locale

Per testare il pacchetto in locale senza pubblicarlo, puoi creare un link simbolico. Questo rende il comando disponibile globalmente sulla tua macchina.

```bash
npm link
```
