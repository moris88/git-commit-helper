import {
  askGeminiForReview,
  askGeminiForGeneratedCommitMessage,
  askGeminiForCommitBody,
  askGeminiForBranchName,
} from './gemini.js'
import {
  askOpenaiForReview,
  askOpenaiForGeneratedCommitMessage,
  askOpenaiForCommitBody,
  askOpenaiForBranchName,
} from './openai.js'
import {
  askOllamaForReview,
  askOllamaForGeneratedCommitMessage,
  askOllamaForCommitBody,
  askOllamaForBranchName,
} from './ollama.js'
import { typeOfAI } from './config.js'

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
