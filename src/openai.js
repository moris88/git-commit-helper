import OpenAI from 'openai'
import chalk from 'chalk'
import fs from 'fs'
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

async function callOpenai(prompt, config) {
  try {
    const APPROX_CHARS_PER_TOKEN = 4
    const MAX_INPUT_TOKENS = 900_000 // lasciamo margine all'output
    const maxChars = MAX_INPUT_TOKENS * APPROX_CHARS_PER_TOKEN // ≈ 3.6M caratteri

    const sliced = prompt.substring(0, maxChars)
    const ai = new OpenAI({ apiKey: config.openaiApiKey })
    const response = await ai.chat.completions.create({
      model: config.openaiModel || 'o4-mini', // Default to o4-mini if not specified
      messages: [{ role: 'user', content: sliced }],
    })
    return response?.choices?.[0]?.message?.content ?? null
  } catch (error) {
    console.error(chalk.yellow(t('reviewError')), error.message)
    return null
  }
}

export async function askOpenaiForReview(config) {
  const diff = getDiff(true)
  if (!diff) {
    console.log(chalk.yellow(t('noStagedChanges')))
    process.exit(1)
  }

  const reviewPromptTemplate = getPrompt('review')
  const reviewPrompt = reviewPromptTemplate
    .replace('{minReviewScore}', config.minReviewScore || 6)
    .replace('{diff}', diff)

  return callOpenai(reviewPrompt, config)
}

export async function askOpenaiForGeneratedCommitMessage(config) {
  const diff = getDiff(true)
  if (!diff) {
    console.log(chalk.yellow(t('noStagedChanges')))
    process.exit(1)
  }
  const commitPromptTemplate = getPrompt('commit')
  const prompt = commitPromptTemplate
    .replace('{maxSubjectLength}', config.maxSubjectLength || 50)
    .replace('{diff}', diff)

  return callOpenai(prompt, config)
}

export async function askOpenaiForCommitBody(config) {
  const diff = getDiff(true)
  if (!diff) {
    return null
  }
  const bodyPromptTemplate = getPrompt('commit-body')
  const prompt = bodyPromptTemplate.replace('{diff}', diff)

  return callOpenai(prompt, config)
}

export async function askOpenaiForBranchName(config) {
  const diff = getDiff(false) // Get unstaged changes
  if (!diff) {
    return null
  }
  const branchPromptTemplate = getPrompt('branch')
  const prompt = branchPromptTemplate.replace('{diff}', diff)

  const branchName = await callOpenai(prompt, config)
  return branchName
    ? branchName.trim().replace(/\s+/g, '-').toLowerCase()
    : null
}
