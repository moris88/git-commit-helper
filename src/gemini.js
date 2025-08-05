import { GoogleGenAI } from '@google/genai'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import { getDiff } from './git.js'
import { t } from './i18n.js'

function getPrompt(name) {
  const promptPath = path.join(__dirname, 'prompts', `${name}.txt`)
  return fs.readFileSync(promptPath, 'utf-8')
}

async function callGemini(prompt, config) {
  try {
    const APPROX_CHARS_PER_TOKEN = 4
    const MAX_INPUT_TOKENS = 900_000 // lasciamo margine all'output
    const maxChars = MAX_INPUT_TOKENS * APPROX_CHARS_PER_TOKEN // ≈ 3.6M caratteri

    const sliced = prompt.substring(0, maxChars)
    const ai = new GoogleGenAI({ apiKey: config.geminiApiKey })
    const response = await ai.models.generateContent({
      model: config.geminiModel || 'gemini-2.5-flash', // Default to gemini-2.5-flash if not specified
      contents: sliced,
      maxOutputTokens: 60_000,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
      },
    })
    return response?.candidates?.[0]?.content?.parts?.[0]?.text ?? null
  } catch (error) {
    console.error(chalk.yellow(t('reviewError')), error.message)
    return null
  }
}

export async function askGeminiForReview(config) {
  const diff = getDiff(true)
  if (!diff) {
    console.log(chalk.yellow(t('noStagedChanges')))
    process.exit(1)
  }

  const reviewPromptTemplate = getPrompt('review')
  const reviewPrompt = reviewPromptTemplate
    .replace('{minReviewScore}', config.minReviewScore || 6)
    .replace('{diff}', diff)

  return callGemini(reviewPrompt, config)
}

export async function askGeminiForGeneratedCommitMessage(config) {
  const diff = getDiff(true)
  if (!diff) {
    console.log(chalk.yellow(t('noStagedChanges')))
    process.exit(1)
  }
  const commitPromptTemplate = getPrompt('commit')
  const prompt = commitPromptTemplate
    .replace('{maxSubjectLength}', config.maxSubjectLength || 50)
    .replace('{diff}', diff)

  return callGemini(prompt, config)
}

export async function askGeminiForCommitBody(config) {
  const diff = getDiff(true)
  if (!diff) {
    return null
  }
  const bodyPromptTemplate = getPrompt('commit-body')
  const prompt = bodyPromptTemplate.replace('{diff}', diff)

  return callGemini(prompt, config)
}

export async function askGeminiForBranchName(config) {
  const diff = getDiff(false) // Get unstaged changes
  if (!diff) {
    return null
  }
  const branchPromptTemplate = getPrompt('branch')
  const prompt = branchPromptTemplate.replace('{diff}', diff)

  const branchName = await callGemini(prompt, config)
  return branchName
    ? branchName.trim().replace(/\s+/g, '-').toLowerCase()
    : null
}
