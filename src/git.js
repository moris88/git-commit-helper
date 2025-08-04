import { execSync } from 'child_process'
import chalk from 'chalk'
import inquirer from 'inquirer'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { t } from './i18n.js'
import { askGeminiForBranchName } from './gemini.js'


export function getDiff(cached = true) {
  try {
    const command = cached ? 'git diff --cached' : 'git diff'
    return execSync(command).toString()
  } catch (error) {
    console.error(chalk.red(t('getDiffError')), error.message)
    return null
  }
}

export function getModifiedFiles() {
  try {
    const deleted = execSync('git ls-files --deleted').toString().trim().split('\n');
    const modified = execSync('git ls-files --modified').toString().trim().split('\n');
    const others = execSync('git ls-files --others --exclude-standard').toString().trim().split('\n');
    
    const allFiles = [...deleted, ...modified, ...others].filter(Boolean);
    return [...new Set(allFiles)]; // Remove duplicates
  } catch (error) {
    console.error(chalk.red(t('getDiffError')), error.message)
    return [];
  }
}

export function getDiffForFiles(files) {
  if (!files || files.length === 0) {
    return ''
  }
  try {
    const fileArgs = files.map((file) => `"${file}"`).join(' ')
    return execSync(`git diff -- ${fileArgs}`).toString()
  } catch (error) {
    console.error(chalk.red(t('getDiffError')), error.message)
    return null
  }
}

export function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
  } catch (err) {
    console.error(chalk.red(t('cannotDetermineBranch')))
    process.exit(1)
  }
}

export async function checkBranchAndMaybeCreateNew(config, autoConfirm = false) {
  const forbiddenBranches = ['main', 'master', 'dev']
  const currentBranch = getCurrentBranch()

  if (forbiddenBranches.includes(currentBranch)) {
    console.log(chalk.red(t('protectedBranch', { branch: currentBranch })))

    const suggestedBranchName = await askGeminiForBranchName(config)

    if (autoConfirm) {
      if (suggestedBranchName) {
        try {
          execSync(`git checkout -b ${suggestedBranchName}`, {
            stdio: 'inherit',
          })
          console.log(
            chalk.green(t('branchCreated', { branch: suggestedBranchName }))
          )
        } catch (err) {
          console.error(chalk.red(t('branchCreationError')), err.message)
          process.exit(1)
        }
        return
      } else {
        console.error(chalk.red(t('cannotSuggestBranchName')))
        process.exit(1)
      }
    }

    const { newBranchName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'newBranchName',
        message: t('newBranchName'),
        default: suggestedBranchName,
        validate: (input) =>
          /^[\w\-\/]+$/.test(input) || t('invalidBranchName'),
      },
    ])

    try {
      execSync(`git checkout -b ${newBranchName}`, { stdio: 'inherit' })
      console.log(chalk.green(t('branchCreated', { branch: newBranchName })))
    } catch (err) {
      console.error(chalk.red(t('branchCreationError')), err.message)
      process.exit(1)
    }
  } else {
    console.log(chalk.blue(t('currentBranch', { branch: currentBranch })))
  }
}

export function stageFiles(files) {
  for (const file of files) {
    execSync(`git add "${file}"`)
  }
}

export function commit(message) {
  const tempFile = path.join(os.tmpdir(), 'gch-commit-msg.txt')
  fs.writeFileSync(tempFile, message)
  try {
    execSync(`git commit -F "${tempFile}"`, {
      stdio: 'inherit',
    })
  } finally {
    fs.unlinkSync(tempFile) // Clean up the temp file
  }
}

export function push(branch) {
  try {
    execSync(`git push`, { stdio: 'inherit' })
    console.log(chalk.green(t('pushSuccess')))
  } catch (error) {
    console.log(chalk.yellow(t('branchNoUpstream', { branch })))
    console.log(chalk.blue(t('runningPushUpstream', { branch })))
    try {
      execSync(`git push --set-upstream origin ${branch}`, {
        stdio: 'inherit',
      })
      console.log(chalk.green(t('pushUpstreamSuccess')))
    } catch (err) {
      console.error(chalk.red(t('pushFailed')), err.message)
      process.exit(1)
    }
  }
}
