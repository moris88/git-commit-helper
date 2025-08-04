import inquirer from 'inquirer'
import { loadConfig } from './config.js'
import {
  getModifiedFiles,
  checkBranchAndMaybeCreateNew,
  stageFiles,
  commit,
  push,
  getCurrentBranch,
  getDiffForFiles,
} from './git.js'
import {
  askGeminiForReview,
  askGeminiForGeneratedCommitMessage,
} from './gemini.js'
import {
  printTitle,
  selectFilesToStage,
  confirmReview,
  printMessage,
  printError,
  confirmProceed,
  getEditedCommitMessage,
  validateMessage,
  confirmCommit,
  confirmPush,
} from './ui.js'
import { t } from './i18n.js'

export async function main(args = []) {
  const autoConfirm = args.includes('-y') || args.includes('--yes')
  console.log(autoConfirm ? '--> AUTOCONFIRM!!!' : '')
  printTitle()

  const config = loadConfig()
  if (!config) {
    printError(t('configNotFound'))
    printMessage(t('ensureConfig'))
    process.exit(1)
  }
  if (!config.geminiApiKey) {
    printError(t('apiKeyNotConfigured'))
    printMessage(t('ensureApiKey'))
    process.exit(1)
  }

  await checkBranchAndMaybeCreateNew()

  try {
    const modifiedFiles = getModifiedFiles()
    if (modifiedFiles.length === 0) {
      printMessage(t('noFilesModified'))
      printMessage(t('ensureFilesModified'))
      process.exit(0)
    }

    const selectedFiles = await selectFilesToStage(modifiedFiles, autoConfirm)
    if (selectedFiles.length === 0) {
      printMessage(t('noFilesSelected'))
      process.exit(0)
    }

    // Check diff size before staging
    if (config.maxDiffLines && config.maxDiffLines > 0) {
      const diff = getDiffForFiles(selectedFiles)
      if (diff === null) {
        process.exit(1) // Error already printed in getDiffForFiles
      }
      const lineCount = diff.split('\n').length
      if (lineCount > config.maxDiffLines) {
        printError(
          t('diffTooLarge', {
            maxLines: config.maxDiffLines,
            actualLines: lineCount,
          })
        )
        process.exit(1)
      }
    }

    stageFiles(selectedFiles)
    printMessage(t('filesAddedSuccess'), 'green')

    if (await confirmReview(autoConfirm)) {
      printMessage(`${t('codeAnalysis')}`, 'blue')
      const review = await askGeminiForReview(config)

      if (!review) {
        printMessage(t('reviewUnavailable'))
        process.exit(1)
      }

      printMessage(`\n${t('reviewYourCode')}\n${review}`, 'blue')
      const scoreRegex = /Score:\s*(\d+)\/10/i
      const scoreMatch = scoreRegex.exec(review)

      if (!scoreMatch) {
        printMessage(
          t('invalidScore', {
            score: scoreMatch,
          })
        )
        process.exit(1)
      }

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

    printMessage(t('generatingMessage'), 'blue')
    let commitMessage = await askGeminiForGeneratedCommitMessage(config)
    if (!commitMessage) {
      printMessage(t('commitMessageUnavailable'))
      process.exit(1)
    }
    commitMessage = commitMessage.replace(/```/g, '').replace(/\n/g, '')
    let isProposed = true

    if (!validateMessage(commitMessage, config)) {
      printError(
        t('validationError', {
          message: commitMessage,
        })
      )
      let fixMessage = true
      if (!autoConfirm) {
        const answers = await inquirer.prompt({
          type: 'confirm',
          name: 'fixMessage',
          message: t('editCommitMessage'),
          default: true,
        })
        fixMessage = answers.fixMessage
      }

      if (fixMessage) {
        commitMessage = await getEditedCommitMessage(commitMessage, config)
        isProposed = false
      } else {
        printMessage(t('commitCancelled'))
        process.exit(1)
      }
    }

    if (await confirmCommit(commitMessage, isProposed, autoConfirm)) {
      commit(commitMessage)
      printMessage(t('commitSuccess'), 'green')
    } else {
      printMessage(t('commitCancelled'))
      process.exit(0)
    }

    if (await confirmPush(autoConfirm)) {
      const currentBranch = getCurrentBranch()
      push(currentBranch)
      printMessage(t('goodbye'))
      process.exit(0)
    } else {
      printMessage(t('commitCancelled'))
      process.exit(0)
    }
  } catch (error) {
    if (
      error.message.includes('User force closed the prompt') ||
      error.message.includes('Abort')
    ) {
      printMessage(`\n${t('goodbye')}`)
      process.exit(0)
    }
    // Ensure inquirer is not left hanging
    if (error.isTtyError) {
      printError("Prompt couldn't be rendered in the current environment")
    } else {
      printError(`${t('error')}: ${error.message}`)
    }
    process.exit(1)
  }
}
