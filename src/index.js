#!/usr/bin/env node
import { execSync } from 'child_process'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'
import figlet from 'figlet'
import fetch from 'node-fetch'
import { t } from './i18n.js'

// Configurazione
function loadConfig() {
  // Cerca nella repository corrente
  const localConfigPath = resolve(process.cwd(), 'gch.config.json')

  if (existsSync(localConfigPath)) {
    return JSON.parse(readFileSync(localConfigPath, 'utf-8'))
  }

  return null
}

// score di review minimo
const MIN_REVIEW_SCORE = 7

// Configurazione predefinita
const MIN_TOKEN_LENGTH = 3000

// Esempio di uso
const config = loadConfig()

if (!config) {
  console.log(chalk.blue(t('loadingConfig')))
  console.error(chalk.red(t('configNotFound')))
  console.log(
    chalk.yellow(
      t('ensureConfig')
    )
  )
  process.exit(1)
}

if (!config.geminiApiKey) {
  console.log(chalk.blue(t('loadingConfig')))
  console.error(chalk.red(t('apiKeyNotConfigured')))
  console.log(
    chalk.yellow(
      t('ensureApiKey')
    )
  )
  process.exit(1)
}

// Configurazione Conventional Commits
const COMMIT_TYPES = [
  { name: 'feat', description: t('commitTypeFeat') },
  { name: 'fix', description: t('commitTypeFix') },
  { name: 'docs', description: t('commitTypeDocs') },
  { name: 'style', description: t('commitTypeStyle') },
  { name: 'refactor', description: t('commitTypeRefactor') },
  { name: 'perf', description: t('commitTypePerf') },
  { name: 'test', description: t('commitTypeTest') },
  { name: 'chore', description: t('commitTypeChore') },
  {
    name: 'BREAKING CHANGE',
    description: t('commitTypeBreaking'),
  },
]

async function askGeminiForReview() {
  console.log(chalk.blue(`\n${t('codeAnalysis')}`))
  const diff = getDiff()
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
Score: 0/10`

  try {
    const result = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: reviewPrompt }] }],
        }),
      }
    )
    const response = await result.json()
    return response?.candidates?.[0]?.content?.parts?.[0]?.text ?? null
  } catch (error) {
    console.error(chalk.yellow(t('reviewError')), error.message)
    return null
  }
}

async function askGeminiForGeneratedCommitMessage() {
  const diff = getDiff()
  if (!diff) {
    console.log(chalk.yellow(t('noStagedChanges')))
    process.exit(1)
  }

  // Genera prompt per Gemini
  const prompt = `Genera UN SOLO messaggio di commit seguendo STRETTAMENTE queste regole:

REGOLE OBBLIGATORIE:
1. Formato: <tipo>(<ambito>)?: <descrizione>
2. Lunghezza TOTALE MASSIMA: 50 caratteri (controlla prima di rispondere)
3. Lingua: inglese
4. Struttura:
   - Tipo: feat, fix, docs, style, refactor, perf, test, chore, BREAKING CHANGE
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

Diff: ${diff.substring(0, MIN_TOKEN_LENGTH)}`
  console.log(chalk.blue(t('generatingMessage')))
  try {
    const result = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    )
    const response = await result.json()
    return response?.candidates?.[0]?.content?.parts?.[0]?.text ?? null
  } catch (error) {
    console.error(chalk.yellow(t('reviewError')), error.message)
    return null
  }
}

function validateMessage(msg) {
  const subject = msg.trim() // Trim per sicurezza

  // Verifica lunghezza soggetto
  if (subject.length > config.maxSubjectLength) {
    console.log(
      chalk.red(
        t('subjectTooLong', { maxLength: config.maxSubjectLength, length: subject.length })
      )
    )
    return false
  }

  const commitType = COMMIT_TYPES.map((type) => type.name).find(
    (type) => type === subject.split(':')[0].trim()
  )

  // Regex migliorata (gestisce più spazi dopo : e controlla meglio gli scope)
  const commitRegex = new RegExp(`^${commitType}(?:\\([^)]+\\))?:\\s+.+`)

  if (!commitRegex.test(subject)) {
    console.log(
      chalk.red(
        t('invalidFormat')
      )
    )
    return false
  }

  return true
}

function getDiff() {
  try {
    return execSync('git diff --cached').toString()
  } catch (error) {
    console.error(
      chalk.red(t('getDiffError')),
      error.message
    )
    return null
  }
}

function getModifiedFiles() {
  const output = execSync('git status --porcelain').toString();
  const lines = output.split('\n').filter(Boolean);

  const unquotePath = (path) => {
    if (path.startsWith('"') && path.endsWith('"')) {
      // Use JSON.parse to correctly handle escaped characters inside the quoted string.
      try {
        return JSON.parse(path);
      } catch (e) {
        // Fallback for safety, though git's output should be valid.
        return path.substring(1, path.length - 1);
      }
    }
    return path;
  };

  const files = lines.map(line => {
    const status = line.substring(0, 2);
    const pathPart = line.substring(3);

    // For renamed files (e.g., 'R  "old" -> "new"'), we want the new path.
    // The separator is ' -> '.
    if (status.startsWith('R')) {
      const parts = pathPart.split(' -> ');
      // The new path is the second part.
      return unquotePath(parts[1].trim());
    }

    return unquotePath(pathPart.trim());
  }).filter(Boolean);

  return files;
}

function AsciiTitle(text) {
  return new Promise(async (resolve) => {
    const asciiTitle = await figlet.text(text, {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      whitespaceBreak: true,
    })

    console.log(asciiTitle)
    resolve()
  })
}

function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
  } catch (err) {
    console.error(chalk.red(t('cannotDetermineBranch')))
    process.exit(1)
  }
}

async function checkBranchAndMaybeCreateNew() {
  const forbiddenBranches = ['main', 'master', 'dev']
  const currentBranch = getCurrentBranch()

  if (forbiddenBranches.includes(currentBranch)) {
    console.log(
      chalk.red(
        t('protectedBranch', { branch: currentBranch })
      )
    )

    const { newBranchName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'newBranchName',
        message: t('newBranchName'),
        validate: (input) =>
          /^[\w\-\/]+$/.test(input) || t('invalidBranchName'),
      },
    ])

    try {
      execSync(`git checkout -b ${newBranchName}`, { stdio: 'inherit' })
      console.log(
        chalk.green(t('branchCreated', { branch: newBranchName }))
      )
    } catch (err) {
      console.error(
        chalk.red(t('branchCreationError')),
        err.message
      )
      process.exit(1)
    }
  }
  else {
    console.log(chalk.blue(t('currentBranch', { branch: currentBranch })))
  }
}

async function main() {
  await AsciiTitle(t('mainTitle'))
  console.log(chalk.blue(`\n${t('exitMessage')}\n`))
  await checkBranchAndMaybeCreateNew()
  try {
    // 1. Controllo delle modifiche staged
    const modifiedFiles = getModifiedFiles()

    if (modifiedFiles.length === 0) {
      console.log(chalk.red(t('noFilesModified')))
      console.log(
        chalk.yellow(
          t('ensureFilesModified')
        )
      )
      process.exit(0)
    }

    if (modifiedFiles.length === 1) {
      console.log(chalk.blue(t('fileModified', { file: modifiedFiles[0] })))
      execSync(`git add "${modifiedFiles[0]}"`)
      console.log(chalk.green(t('fileAddedSuccess')))
    } else {
      console.log(
        chalk.blue(
          t('filesModified', { count: modifiedFiles.length, files: modifiedFiles.join('\n') })
        )
      )

      const { selectedFiles } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedFiles',
          message: t('selectFiles'),
          choices: modifiedFiles.map((file) => ({
            name: file,
            checked: true,
          })),
        },
      ])

      if (selectedFiles.length === 0) {
        console.log(
          chalk.yellow(t('noFilesSelected'))
        )
        process.exit(0)
      }

      for (const file of selectedFiles) {
        execSync(`git add "${file}"`)
      }

      console.log(chalk.green(t('filesAddedSuccess')))
    }

    // 2. Richiesta di review del codice
    const { wantReview } = await inquirer.prompt({
      type: 'confirm',
      name: 'wantReview',
      message: t('askForReview'),
      default: true,
    })

    if (wantReview) {
      const review = await askGeminiForReview()

      if (review === null) {
        console.log(chalk.yellow(t('reviewUnavailable')))
        process.exit(1)
      }
      console.log(chalk.blue(`\n${t('reviewYourCode')}\n`), review)
      const score = review.match(/Score:\s*(\d+)\/10/i)
      if (!score) {
        console.log(
          chalk.yellow(t('invalidScore', { score }))
        )
        process.exit(1)
      }
      const scoreValue = parseInt(score[1], 10)
      if (scoreValue < MIN_REVIEW_SCORE) {
        console.log(
          chalk.red(
            t('reviewScoreLow', { score: scoreValue })
          )
        )
        const { proceedAnyway } = await inquirer.prompt({
          type: 'confirm',
          name: 'proceedAnyway',
          message: t('proceedAnyway'),
          default: false,
        })
        if (!proceedAnyway) process.exit(1)
      } else {
        console.log(
          chalk.green(
            t('reviewScoreHigh', { score: scoreValue })
          )
        )
      }
    }

    // 3. Generazione del messaggio di commit
    let msgGemini = await askGeminiForGeneratedCommitMessage()
    if (msgGemini === null) {
      console.log(
        chalk.yellow(t('commitMessageUnavailable'))
      )
      process.exit(1)
    }
    let commitMessage = msgGemini.replace(/```/g, '').replace(/\n/g, '')
    let commitProposed = true

    // 4. Controllo della lunghezza del messaggio e validazione
    const validationResult = validateMessage(commitMessage)
    if (!validationResult) {
      console.error(chalk.red(t('validationError', { message: commitMessage })))
      const { fixMessage } = await inquirer.prompt({
        type: 'confirm',
        name: 'fixMessage',
        message: t('editCommitMessage'),
        default: true,
      })
      if (fixMessage) {
        // 3b. Modifica del messaggio di commit
        console.log(chalk.blue(t('modifyingCommitMessage')))
        const { commitType } = await inquirer.prompt([
          {
            type: 'list',
            name: 'commitType',
            message: t('selectCommitType'),
            default: config.defaultCommitType,
            validate: (input) =>
              COMMIT_TYPES.some((type) => type.name === input) ||
              t('invalidCommitType'),
            // Mostra le opzioni con descrizione
            choices: COMMIT_TYPES.map((type) => ({
              name: type.name.padEnd(8) + ' - ' + type.description,
              value: type.name,
            })),
          },
        ])
        const { newMessage } = await inquirer.prompt({
          type: 'input',
          name: 'newMessage',
          message: t('newCommitMessage'),
          default: commitMessage.split(':')[1].trim(),
        })
        commitMessage = `${commitType}: ${newMessage}`
        commitProposed = false
      } else {
        console.log(chalk.yellow(t('commitCancelled')))
        process.exit(1)
      }
    }

    // 4. Mostra anteprima e chiedi conferma
    console.log(
      chalk.green(
        commitProposed
          ? t('proposedCommitPreview')
          : t('modifiedCommitPreview')
      )
    )
    console.log(chalk.cyan(t('commitPreviewLine')))
    console.log(chalk.cyan(commitMessage))
    console.log(chalk.cyan(t('commitPreviewLine')))

    const { confirmCommit } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmCommit',
        message: t('confirmCommit'),
        default: true,
      },
    ])

    if (confirmCommit) {
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\"')}"`, {
        stdio: 'inherit',
      })
      console.log(chalk.green(t('commitSuccess')))
    } else {
      console.log(chalk.yellow(t('commitCancelled')))
      process.exit(0)
    }

    // 5. Push delle modifiche
    console.log(chalk.blue(`\n${t('readyToPush')}`))
    const { confirmPush } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmPush',
        message: t('confirmPush'),
        default: true,
      },
    ])

    if (confirmPush) {
      try {
        execSync(`git push`, { stdio: 'inherit' })
        console.log(chalk.green(t('pushSuccess')))
      } catch (error) {
        // 5b. Se il push fallisce perché non c'è un upstream remoto
        const currentBranch = getCurrentBranch()
        console.log(
          chalk.yellow(
            t('branchNoUpstream', { branch: currentBranch })
          )
        )
        console.log(
          chalk.blue(
            t('runningPushUpstream', { branch: currentBranch })
          )
        )

        try {
          execSync(`git push --set-upstream origin ${currentBranch}`, {
            stdio: 'inherit',
          })
          console.log(
            chalk.green(t('pushUpstreamSuccess'))
          )
        } catch (err) {
          console.error(chalk.red(t('pushFailed')), err.message)
          process.exit(1)
        }
      }
      console.log(t('goodbye'))
      process.exit(0)
    } else {
      console.log(chalk.yellow(t('commitCancelled')))
      process.exit(0)
    }
  } catch (error) {
    console.error(chalk.red(t('error')), error.message)
    process.exit(1)
  }
}

main()
