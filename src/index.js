#!/usr/bin/env node
import { execSync } from 'child_process'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'
import figlet from 'figlet'
import fetch from 'node-fetch'

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
  console.log(chalk.blue('🔧 Caricamento configurazione...'))
  console.error(chalk.red('ERRORE: Configurazione non trovata.'))
  console.log(
    chalk.yellow(
      'Assicurati di avere un file gch.config.json nella root del progetto.'
    )
  )
  process.exit(1)
}

if (!config.geminiApiKey) {
  console.log(chalk.blue('🔧 Caricamento configurazione...'))
  console.error(chalk.red('ERRORE: Chiave API key non configurata.'))
  console.log(
    chalk.yellow(
      'Assicurati di avere la chiave API key di Gemini AI nel file gch.config.json.'
    )
  )
  process.exit(1)
}

// Configurazione Conventional Commits
const COMMIT_TYPES = [
  { name: 'feat', description: 'Una nuova funzionalità' },
  { name: 'fix', description: 'Una correzione di bug' },
  { name: 'docs', description: 'Modifiche alla documentazione' },
  { name: 'style', description: 'Formattazione, stile' },
  { name: 'refactor', description: 'Refactoring del codice' },
  { name: 'perf', description: 'Miglioramento delle prestazioni' },
  { name: 'test', description: 'Aggiunta o modifica di test' },
  { name: 'chore', description: 'Attività di manutenzione' },
  {
    name: 'BREAKING CHANGE',
    description: 'Modifica che rompe la compatibilità',
  },
]

async function askGeminiForReview() {
  console.log(chalk.blue('\n🔍 Analisi del codice in corso...'))
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
    console.error(chalk.yellow('⚠️ Errore durante la review:'), error.message)
    return null
  }
}

async function askGeminiForGeneratedCommitMessage() {
  const diff = getDiff()
  if (!diff) {
    console.log(chalk.yellow('Nessuna modifica staged per il commit'))
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
  console.log(chalk.blue('⌛​ Attendi qualche secondo per la generazione...'))
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
    console.error(chalk.yellow('⚠️​ Errore durante la review:'), error.message)
    return null
  }
}

function validateMessage(msg) {
  const subject = msg.trim() // Trim per sicurezza

  // Verifica lunghezza soggetto
  if (subject.length > config.maxSubjectLength) {
    console.log(
      chalk.red(
        `La riga soggetto supera ${config.maxSubjectLength} caratteri (${subject.length})`
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
        "Formato Conventional Commit non valido. Esempio: 'feat: descrizione' o 'feat(scope): descrizione'"
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
      chalk.red('Errore durante il recupero delle modifiche staged:'),
      error.message
    )
    return null
  }
}

function getModifiedFiles() {
  const output = execSync('git status --porcelain').toString()
  const lines = output.split('\n').filter(Boolean)
  const files = lines.map((line) => line.slice(3).trim()).filter(Boolean)
  return files
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
    console.error(chalk.red('❌ Impossibile determinare il branch corrente'))
    process.exit(1)
  }
}

async function checkBranchAndMaybeCreateNew() {
  const forbiddenBranches = ['main', 'master', 'dev']
  const currentBranch = getCurrentBranch()

  if (forbiddenBranches.includes(currentBranch)) {
    console.log(
      chalk.red(
        `🚫 Sei sul branch protetto "${currentBranch}". Il commit non è permesso direttamente qui.`
      )
    )

    const { newBranchName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'newBranchName',
        message: 'Inserisci il nome del nuovo branch:',
        validate: (input) =>
          /^[\w\-\/]+$/.test(input) || 'Il nome del branch non è valido',
      },
    ])

    try {
      execSync(`git checkout -b ${newBranchName}`, { stdio: 'inherit' })
      console.log(
        chalk.green(`✔️ Nuovo branch '${newBranchName}' creato e attivato.`)
      )
    } catch (err) {
      console.error(
        chalk.red('❌ Errore nella creazione del branch:'),
        err.message
      )
      process.exit(1)
    }
  } else {
    console.log(chalk.blue(`✅ Branch corrente: ${currentBranch}`))
  }
}

async function main() {
  await AsciiTitle('The Git Commit Helper IT')
  console.log(chalk.blue('\n🔧 ctrl+c => exit 🔧\n'))
  await checkBranchAndMaybeCreateNew()
  try {
    // 1. Controllo delle modifiche staged
    const modifiedFiles = getModifiedFiles()

    if (modifiedFiles.length === 0) {
      console.log(chalk.red('❌ Nessun file modificato da aggiungere.'))
      console.log(
        chalk.yellow(
          'Assicurati di modificare o aggiungere i file prima di eseguire il commit.'
        )
      )
      process.exit(0)
    }

    if (modifiedFiles.length === 1) {
      console.log(chalk.blue(`🛠️ File modificato: ${modifiedFiles[0]}`))
      execSync(`git add "${modifiedFiles[0]}"`)
      console.log(chalk.green('✔️​ File aggiunto con successo!'))
    } else {
      console.log(
        chalk.blue(
          `🛠️ File modificati (${modifiedFiles.length}):\n${modifiedFiles.join('\n')}`
        )
      )

      const { selectedFiles } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedFiles',
          message:
            'Seleziona i file da aggiungere al commit: (default tutti selezionati)',
          choices: modifiedFiles.map((file) => ({
            name: file,
            checked: true,
          })),
        },
      ])

      if (selectedFiles.length === 0) {
        console.log(
          chalk.yellow('❌ Nessun file selezionato. Commit annullato.')
        )
        process.exit(0)
      }

      for (const file of selectedFiles) {
        execSync(`git add "${file}"`)
      }

      console.log(chalk.green('✔️​ File aggiunti con successo!'))
    }

    // 2. Richiesta di review del codice
    const { wantReview } = await inquirer.prompt({
      type: 'confirm',
      name: 'wantReview',
      message: 'Vuoi una review del codice prima di procedere?',
      default: true,
    })

    if (wantReview) {
      const review = await askGeminiForReview()

      if (review === null) {
        console.log(chalk.yellow('⚠️​ Impossibile ottenere una review'))
        process.exit(1)
      }
      console.log(chalk.blue('\n🔍 Review tuo codice:\n'), review)
      const score = review.match(/Score:\s*(\d+)\/10/i)
      if (!score) {
        console.log(
          chalk.yellow(`⚠️​ Review non contiene un punteggio valido, ${score}`)
        )
        process.exit(1)
      }
      const scoreValue = parseInt(score[1], 10)
      if (scoreValue < MIN_REVIEW_SCORE) {
        console.log(
          chalk.red(
            `\n❌ Review score: ${scoreValue}/10 - Modifiche non sufficienti`
          )
        )
        const { proceedAnyway } = await inquirer.prompt({
          type: 'confirm',
          name: 'proceedAnyway',
          message:
            'Vuoi procedere comunque? (Attenzione: le modifiche potrebbero non essere adeguate)',
          default: false,
        })
        if (!proceedAnyway) process.exit(1)
      } else {
        console.log(
          chalk.green(
            `\n✅ Review score: ${scoreValue}/10 - Modifiche approvate da Gemini!`
          )
        )
      }
    }

    // 3. Generazione del messaggio di commit
    let msgGemini = await askGeminiForGeneratedCommitMessage()
    if (msgGemini === null) {
      console.log(
        chalk.yellow('⚠️​ Impossibile generare il messaggio di commit')
      )
      process.exit(1)
    }
    let commitMessage = msgGemini.replace(/```/g, '').replace(/\n/g, '')
    let commitProposed = true

    // 4. Controllo della lunghezza del messaggio e validazione
    const validationResult = validateMessage(commitMessage)
    if (!validationResult) {
      console.error(chalk.red(`❌ Errore di validazione: ${commitMessage}`))
      const { fixMessage } = await inquirer.prompt({
        type: 'confirm',
        name: 'fixMessage',
        message: 'Vuoi modificare il messaggio di commit?',
        default: true,
      })
      if (fixMessage) {
        // 3b. Modifica del messaggio di commit
        console.log(chalk.blue('🔧 Modifica del messaggio di commit...'))
        const { commitType } = await inquirer.prompt([
          {
            type: 'list',
            name: 'commitType',
            message: 'Seleziona il tipo di commit:',
            default: config.defaultCommitType,
            validate: (input) =>
              COMMIT_TYPES.some((type) => type.name === input) ||
              'Tipo di commit non valido',
            // Mostra le opzioni con descrizione
            choices: COMMIT_TYPES.map((type) => ({
              name: `${type.name.padEnd(8)} - ${type.description}`,
              value: type.name,
            })),
          },
        ])
        const { newMessage } = await inquirer.prompt({
          type: 'input',
          name: 'newMessage',
          message: 'Inserisci il nuovo messaggio di commit (solo messaggio):',
          default: '',
        })
        msg = `${commitType}: ${newMessage}`
        commitProposed = false
      } else {
        console.log(chalk.yellow('❌ Commit annullato'))
        process.exit(1)
      }
    }

    // 4. Mostra anteprima e chiedi conferma
    console.log(
      chalk.green(
        commitProposed
          ? '\n✅ Anteprima messaggio di commit proposto:'
          : '\n✅ Anteprima messaggio di commit modificato:'
      )
    )
    console.log(chalk.cyan('---'))
    console.log(chalk.cyan(commitMessage))
    console.log(chalk.cyan('---'))

    const { confirmCommit } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmCommit',
        message: 'Procedere con il commit?',
        default: true,
      },
    ])

    if (confirmCommit) {
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
        stdio: 'inherit',
      })
      console.log(chalk.green('✔️​ Commit creato con successo!'))
    } else {
      console.log(chalk.yellow('❌ Commit annullato'))
      process.exit(0)
    }

    // 5. Push delle modifiche
    console.log(chalk.blue('\n🚀 Pronto per il push delle modifiche...'))
    const { confirmPush } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmPush',
        message: 'Procedere con il push?',
        default: true,
      },
    ])

    if (confirmPush) {
      try {
        execSync(`git push`, { stdio: 'inherit' })
        console.log(chalk.green('✔️​ Push eseguito con successo!'))
      } catch (error) {
        // 5b. Se il push fallisce perché non c'è un upstream remoto
        const currentBranch = getCurrentBranch()
        console.log(
          chalk.yellow(
            `\n⚠️ Il branch '${currentBranch}' non ha upstream remoto.`
          )
        )
        console.log(
          chalk.blue(
            `🌐 Eseguo: git push --set-upstream origin ${currentBranch}\n`
          )
        )

        try {
          execSync(`git push --set-upstream origin ${currentBranch}`, {
            stdio: 'inherit',
          })
          console.log(
            chalk.green('✔️​ Push con upstream eseguito con successo!')
          )
        } catch (err) {
          console.error(chalk.red('❌ Push fallito:'), err.message)
          process.exit(1)
        }
      }
      console.log('🎉 Ci sentiamo al prossimo commit! Buon sviluppo! 🎉')
      process.exit(0)
    } else {
      console.log(chalk.yellow('❌ Push annullato'))
      process.exit(0)
    }
  } catch (error) {
    console.error(chalk.red('Errore:'), error.message)
    process.exit(1)
  }
}

main()
