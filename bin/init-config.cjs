#!/usr/bin/env node
const { writeFileSync, existsSync } = require('fs')
const { resolve } = require('path')
const { homedir } = require('os')
const { t } = require('../src/i18n.js')

const template = {
  geminiApiKey: 'your-api-key-here', // Replace with your actual Gemini API key
  geminiModel: 'gemini-1.5-flash', // Default model for Gemini AI
  aiReviewEnabled: true, // Enable AI review feature
  defaultCommitType: 'feat', // Default commit type for Conventional Commits
  maxSubjectLength: 50, // Maximum length of the commit subject line
  maxDiffLines: 3500, // Maximum number of lines in the diff for AI reviews
  minReviewScore: 6, // Minimum review score for AI reviews
  preCommitCommands: [
    'npm run lint', // Command to run before committing
    'npm run test' // Command to run before committing, can be customized
  ],
}

try {
  console.log(t('initialization'))
  const isGlobal =
    process.argv.includes('--global') || process.argv.includes('-g')
  const configPath = isGlobal
    ? resolve(homedir(), '.gch.config.json')
    : resolve(process.cwd(), 'gch.config.json')
  const displayPath = isGlobal ? homedir() : process.cwd()

  if (!existsSync(configPath)) {
    writeFileSync(configPath, JSON.stringify(template, null, 2))
    console.log(t('configCreated', { path: displayPath }))
  } else {
    console.log(t('configExists', { path: displayPath }))
  }
  process.exit(0)
} catch (error) {
  console.error(t('configCreationError'), error.message)
  process.exit(1)
}
