import { execSync } from 'child_process'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { t } from './i18n.js'

export function getDiff() {
  try {
    return execSync('git diff --cached').toString()
  } catch (error) {
    console.error(chalk.red(t('getDiffError')), error.message)
    return null
  }
}

export function getModifiedFiles() {
  const output = execSync('git status --porcelain').toString()
  const lines = output.split('\n').filter(Boolean)

  const unquotePath = (path) => {
    if (path.startsWith('"') && path.endsWith('"')) {
      try {
        return JSON.parse(path)
      } catch (e) {
        return path.substring(1, path.length - 1)
      }
    }
    return path
  }

  const files = lines
    .map((line) => {
      const status = line.substring(0, 2)
      const pathPart = line.substring(3)

      if (status.startsWith('R')) {
        const parts = pathPart.split(' -> ')
        return unquotePath(parts[1].trim())
      }

      return unquotePath(pathPart.trim())
    })
    .filter(Boolean)

  return files
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

export async function checkBranchAndMaybeCreateNew() {
  const forbiddenBranches = ['main', 'master', 'dev']
  const currentBranch = getCurrentBranch()

  if (forbiddenBranches.includes(currentBranch)) {
    console.log(chalk.red(t('protectedBranch', { branch: currentBranch })))

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
  execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
    stdio: 'inherit',
  })
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
