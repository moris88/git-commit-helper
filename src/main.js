import chalk from 'chalk'
import { execSync } from 'child_process'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { getAIProvider } from './ai-provider.js'
import { loadConfig, typeOfAI } from './config.js'
import {
  checkBranchAndMaybeCreateNew,
  checkoutBranch,
  commit,
  getBranchGraph,
  getCurrentBranch,
  getDiffForFiles,
  getLatestLogs,
  getLocalBranches,
  getModifiedFiles,
  hasCommitsToPush,
  isLastCommitPushed,
  push,
  rebase,
  stageFiles,
  undoLastCommit,
} from './git.js'
import { t } from './i18n.js'
import { translateIfNeeded } from './translator.js'
import {
  confirmCommit,
  confirmGenerateBody,
  confirmProceed,
  confirmPush,
  confirmReview,
  confirmRunPreCommit,
  getEditedCommitMessage,
  printError,
  printMessage,
  printTitle,
  selectBranchForRebase,
  selectBranchToCheckout,
  selectFilesToStage,
  validateMessage,
} from './ui.js'

// Helper function to initialize configuration
async function initialize(printHeader = true) {
  if (printHeader) {
    printTitle()
  }

  const config = loadConfig()

  if (!config) {
    printError(t('configNotFound'))
    printMessage(t('ensureConfig'))
    process.exit(1)
  }

  const { geminiApiKey, geminiModel, openaiApiKey, openaiModel, ollamaModel } =
    config

  const hasGemini = geminiApiKey && geminiModel
  const hasOpenAI = openaiApiKey && openaiModel
  const hasOllama = ollamaModel

  if (hasGemini || hasOpenAI || hasOllama) {
    return config
  }

  if (!geminiApiKey && !openaiApiKey && !ollamaModel) {
    printError(t('apiKeyNotConfigured'))
    printMessage(t('ensureApiKey'))
  }

  if (!geminiModel && !openaiModel && !ollamaModel) {
    printError(t('modelNotConfigured'))
    printMessage(t('ensureModel'))
  }
  process.exit(1)
}

// Helper function for handling file staging
async function handleFileStaging(config, autoConfirm) {
  const modifiedFiles = getModifiedFiles()
  if (modifiedFiles.length === 0) {
    printMessage(t('noFilesModified'))
    return null
  }

  const selectedFiles = await selectFilesToStage(modifiedFiles, autoConfirm)
  if (selectedFiles.length === 0) {
    printMessage(t('noFilesSelected'))
    return null
  }

  if (config.maxDiffLines && config.maxDiffLines > 0) {
    const diff = getDiffForFiles(selectedFiles)
    if (diff === null) {
      process.exit(1)
    }
    const lineCount = diff.split('\n').length
    if (lineCount > config.maxDiffLines) {
      printError(
        t('diffTooLarge', {
          maxLines: config.maxDiffLines,
          actualLines: lineCount,
        })
      )
      return null
    }
  }

  stageFiles(selectedFiles)
  printMessage(t('filesAddedSuccess'), 'green')
  return selectedFiles
}

// Helper function for handling the commit process
async function handleCommit(config, autoConfirm) {
  printMessage(t('generatingMessage'), 'blue')
  const aiProvider = getAIProvider(config)
  if (!aiProvider) {
    printError(t('aiProviderNotFound'))
    process.exit(1)
  }

  let commitMessage = await aiProvider.askForGeneratedCommitMessage(config)
  commitMessage = await translateIfNeeded(commitMessage, config)

  if (!commitMessage) {
    printMessage(t('commitMessageUnavailable') + ' - ' + typeOfAI(config))
    return false
  }
  commitMessage = commitMessage.replace(/```/g, '').replace(/\n/g, '')
  let isProposed = true

  if (!validateMessage(commitMessage, config)) {
    printError(t('validationError', { message: commitMessage }))
    commitMessage = await getEditedCommitMessage(commitMessage, config)
    isProposed = false
  }

  let commitBody = ''
  if (await confirmGenerateBody(autoConfirm)) {
    printMessage(t('generatingBody'), 'blue')
    commitBody = await aiProvider.askForCommitBody(config)
    commitBody = await translateIfNeeded(commitBody, config)
  }

  const finalCommitMessage =
    commitMessage + (commitBody ? `\n\n${commitBody}` : '')

  if (await confirmCommit(finalCommitMessage, isProposed, autoConfirm)) {
    commit(finalCommitMessage)
    printMessage(t('commitSuccess'), 'green')
    return true
  } else {
    printMessage(t('commitCancelled'))
    return false
  }
}

// Logic for the --branch command
async function runBranchLogic(autoConfirm) {
  const config = await initialize()
  await checkBranchAndMaybeCreateNew(config, autoConfirm)
  printMessage(t('branchCreatedSuccess'), 'green')
}

// Logic for the --review command
async function runReviewLogic(autoConfirm) {
  const config = await initialize()
  const stagedFiles = await handleFileStaging(config, autoConfirm)
  if (!stagedFiles) return

  printMessage(`${t('codeAnalysis')}`, 'blue')
  const aiProvider = getAIProvider(config)
  if (!aiProvider) {
    printError(t('aiProviderNotFound'))
    process.exit(1)
  }
  let review = await aiProvider.askForReview(config)
  review = await translateIfNeeded(review, config)

  if (!review) {
    printMessage(t('reviewUnavailable'))
    process.exit(1)
  }
  printMessage(`\n${t('reviewYourCode')}\n${review}`, 'blue')
}

// Logic for the --commit command
async function runCommitLogic(autoConfirm) {
  const config = await initialize()
  const stagedFiles = await handleFileStaging(config, autoConfirm)
  if (!stagedFiles) return

  await handleCommit(config, autoConfirm)
}

// Logic for the --push command
async function runPushLogic(autoConfirm) {
  await initialize()
  if (hasCommitsToPush()) {
    if (await confirmPush(autoConfirm)) {
      const currentBranch = getCurrentBranch()
      push(currentBranch)
      printMessage(t('goodbye'))
    } else {
      printMessage(t('commitCancelled'))
    }
  } else {
    printMessage(t('nothingToPush'), 'yellow')
    printMessage(t('pushCancelled'), 'yellow')
  }
}

// Logic for the --log command
async function runLogLogic() {
  await initialize()
  const logs = getLatestLogs()
  if (logs) {
    printMessage('Last 5 commits:', 'blue')
    console.log(logs)
  }
}

// Logic for the adog command
async function runAdogLogic() {
  await initialize()
  const graph = getBranchGraph()
  if (graph) {
    printMessage('Branch graph:', 'blue')
    console.log(graph)
  }
}

// Logic for the rebase command
async function runRebaseLogic() {
  await initialize()
  const branches = getLocalBranches()
    .split('\n')
    .map((b) => b.trim())
    .filter((b) => b && !b.startsWith('*'))
  const targetBranch = await selectBranchForRebase(branches)
  rebase(targetBranch)
}

// Logic for the undo command
async function runUndoLogic() {
  await initialize()
  if (isLastCommitPushed()) {
    printMessage(t('nothingToUndo'), 'yellow')
  } else {
    undoLastCommit()
  }
}

// Logic for the checkout command
async function runCheckoutLogic() {
  await initialize()
  const branches = getLocalBranches()
    .split('\n')
    .map((b) => b.trim())
    .filter((b) => b && !b.startsWith('*'))
  const targetBranch = await selectBranchToCheckout(branches)
  checkoutBranch(targetBranch)
}

// Logic for the full workflow (no command)
async function runFullWorkflow(autoConfirm) {
  const config = await initialize()
  const aiProvider = getAIProvider(config)

  if (!aiProvider) {
    printError(t('aiProviderNotFound'))
    process.exit(1)
  }

  await checkBranchAndMaybeCreateNew(config, autoConfirm)

  const stagedFiles = await handleFileStaging(config, autoConfirm)
  if (!stagedFiles) process.exit(0)

  if (config.preCommitCommands && config.preCommitCommands.length > 0) {
    const selectedCommands = await confirmRunPreCommit(
      config.preCommitCommands,
      autoConfirm
    )

    if (selectedCommands && selectedCommands.length > 0) {
      printMessage(t('runningPreCommit'), 'blue')
      for (const command of selectedCommands) {
        try {
          printMessage(`  - ${command}`, 'yellow')
          execSync(command, { stdio: 'pipe' }) // Suppress output
          printMessage(t('preCommitSuccess', { command }), 'green')
        } catch (error) {
          printError(t('preCommitFailed', { command }))
          // Continue to the next command
        }
      }
    }
  }

  if (config.aiReviewEnabled !== false) {
    const ai = typeOfAI(config)
    if (await confirmReview(ai, autoConfirm)) {
      printMessage(`${t('codeAnalysis')}`, 'blue')
      let review = await aiProvider.askForReview(config)
      if (review) {
        review = await translateIfNeeded(review, config)
        printMessage(`\n${t('reviewYourCode')}\n${review}`, 'blue')
        const scoreRegex = /Score:\s*(\d+)\/10/i
        const scoreMatch = scoreRegex.exec(review)

        if (scoreMatch) {
          const scoreValue = parseInt(scoreMatch[1], 10)
          if (scoreValue < (config.minReviewScore || 6)) {
            if (!(await confirmProceed(scoreValue, autoConfirm))) {
              process.exit(1)
            }
          } else {
            printMessage(
              t('reviewScoreHigh', {
                score: scoreValue,
              }),
              'green'
            )
          }
        }
      }
    }
  }

  const committed = await handleCommit(config, autoConfirm)
  if (!committed) process.exit(0)

  if (await confirmPush(autoConfirm)) {
    const currentBranch = getCurrentBranch()
    push(currentBranch)
    printMessage(t('goodbye'))
  } else {
    printMessage(t('commitCancelled'))
  }
}

// Error handling function
function handleErrors(error) {
  if (
    error.message.includes('User force closed the prompt') ||
    error.message.includes('Abort')
  ) {
    printMessage(`\n${t('goodbye')}`)
    process.exit(0)
  }
  if (error.isTtyError) {
    printError("Prompt couldn't be rendered in the current environment")
  } else {
    printError(`${t('error')}: ${error.message}`)
  }
  process.exit(1)
}

// Main function to parse args and run logic
export async function main(args) {
  const argv = await yargs(hideBin(args))
    .scriptName('gch')
    .option('yes', {
      alias: 'y',
      type: 'boolean',
      description: 'Run with auto-confirm',
    })
    .command('review', 'Review the staged files', () => {})
    .command('commit', 'Generate a commit message', () => {})
    .command('branch', 'Create a new branch', () => {})
    .command('push', 'Push the current branch', () => {})
    .command('log', 'Show the last 5 commits', () => {})
    .command('adog', 'Show the branch graph', () => {})
    .command('rebase', 'Rebase the current branch', () => {})
    .command('undo', 'Undo the last local commit', () => {})
    .command('checkout', 'Checkout a branch', () => {})
    .help()
    .strict()
    .parseAsync()

  const { _, yes } = argv
  if (yes) {
    console.log(chalk.yellow('Running in auto-confirm mode'))
  }
  const command = _[0]

  try {
    if (command === 'review') {
      await runReviewLogic(yes)
    } else if (command === 'commit') {
      await runCommitLogic(yes)
    } else if (command === 'branch') {
      await runBranchLogic(yes)
    } else if (command === 'push') {
      await runPushLogic(yes)
    } else if (command === 'log') {
      await runLogLogic()
    } else if (command === 'adog') {
      await runAdogLogic()
    } else if (command === 'rebase') {
      await runRebaseLogic()
    } else if (command === 'undo') {
      await runUndoLogic()
    } else if (command === 'checkout') {
      await runCheckoutLogic()
    } else {
      await runFullWorkflow(yes)
    }
  } catch (err) {
    handleErrors(err)
  }
}
