import chalk from 'chalk'
import fs from 'fs'
import ollama from 'ollama'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'
import { getDiff } from './git.js'
import { t } from './i18n.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function getPrompt(name) {
  const promptPath = resolve(__dirname, `../prompts/${name}.txt`)
  return fs.readFileSync(promptPath, 'utf-8')
}

async function callOllama(prompt, config) {
  try {
    const APPROX_CHARS_PER_TOKEN = 4
    const MAX_INPUT_TOKENS = 900_000 // lasciamo margine all'output
    const maxChars = MAX_INPUT_TOKENS * APPROX_CHARS_PER_TOKEN // ≈ 3.6M caratteri

    const sliced = prompt.substring(0, maxChars)
    if (!config.ollamaModel) {
      return null
    }
    const result = await ollama
      .generate({
          model: config.ollamaModel || 'codellama',
          prompt: sliced,
          stream: false,
        })
      .catch((error) => {
        console.error(error)
        console.error(
          chalk.yellow(t('reviewError')),
          'Error fetching from OLLAMA'
        )
        return null
      })
    return result?.response ?? null
  } catch (error) {
    console.error(chalk.yellow(t('reviewError')), error.message)
    return null
  }
}

export async function askOllamaForReview(config) {
  const diff = getDiff(true)
  if (!diff) {
    console.log(chalk.yellow(t('noStagedChanges')))
    process.exit(1)
  }

  const reviewPromptTemplate = getPrompt('review')
  const reviewPrompt = reviewPromptTemplate
    .replace('{minReviewScore}', config.minReviewScore || 6)
    .replace('{diff}', diff)

  return callOllama(reviewPrompt, config)
}

export async function askOllamaForGeneratedCommitMessage(config) {
  const diff = getDiff(true)
  if (!diff) {
    console.log(chalk.yellow(t('noStagedChanges')))
    process.exit(1)
  }
  const commitPromptTemplate = getPrompt('commit')
  const prompt = commitPromptTemplate
    .replace('{maxSubjectLength}', config.maxSubjectLength || 50)
    .replace('{diff}', diff)

  return callOllama(prompt, config)
}

export async function askOllamaForCommitBody(config) {
  const diff = getDiff(true)
  if (!diff) {
    return null
  }
  const bodyPromptTemplate = getPrompt('commit-body')
  const prompt = bodyPromptTemplate.replace('{diff}', diff)

  return callOllama(prompt, config)
}

export async function askOllamaForBranchName(config) {
  const diff = getDiff(false) // Get unstaged changes
  if (!diff) {
    return null
  }
  const branchPromptTemplate = getPrompt('branch')
  const prompt = branchPromptTemplate.replace('{diff}', diff)

  const branchName = await callOllama(prompt, config)
  return branchName
    ? branchName.trim().replace(/\s+/g, '-').toLowerCase()
    : null
}
