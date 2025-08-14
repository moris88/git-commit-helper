import { typeOfAI } from './config.js'
import {
  askGeminiForBranchName,
  askGeminiForCommitBody,
  askGeminiForGeneratedCommitMessage,
  askGeminiForReview,
} from './gemini.js'
import {
  askOllamaForBranchName,
  askOllamaForCommitBody,
  askOllamaForGeneratedCommitMessage,
  askOllamaForReview,
} from './ollama.js'
import {
  askOpenaiForBranchName,
  askOpenaiForCommitBody,
  askOpenaiForGeneratedCommitMessage,
  askOpenaiForReview,
} from './openai.js'

export function getAIProvider(config) {
  const ai = typeOfAI(config)

  switch (ai) {
    case 'gemini':
      return {
        askForReview: (config) => askGeminiForReview(config),
        askForGeneratedCommitMessage: (config) =>
          askGeminiForGeneratedCommitMessage(config),
        askForCommitBody: (config) => askGeminiForCommitBody(config),
        askForBranchName: (config) => askGeminiForBranchName(config),
      }
    case 'openai':
      return {
        askForReview: (config) => askOpenaiForReview(config),
        askForGeneratedCommitMessage: (config) =>
          askOpenaiForGeneratedCommitMessage(config),
        askForCommitBody: (config) => askOpenaiForCommitBody(config),
        askForBranchName: (config) => askOpenaiForBranchName(config),
      }
    case 'ollama':
      return {
        askForReview: (config) => askOllamaForReview(config),
        askForGeneratedCommitMessage: (config) =>
          askOllamaForGeneratedCommitMessage(config),
        askForCommitBody: (config) => askOllamaForCommitBody(config),
        askForBranchName: (config) => askOllamaForBranchName(config),
      }
    default:
      return null
  }
}
