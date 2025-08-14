import { typeOfAI } from './config.js'
import { callGemini } from './gemini.js'
import { getLocale } from './i18n.js'
import { callOllama } from './ollama.js'
import { callOpenai } from './openai.js'
import { getPrompt } from './prompt-loader.js'

async function translate(text, config) {
  const aiProvider = typeOfAI(config)
  const promptTemplate = getPrompt(aiProvider, 'translate')
  const prompt = promptTemplate.replace('{text}', text)

  let translatedText
  switch (aiProvider) {
    case 'gemini':
      translatedText = await callGemini(prompt, config)
      break
    case 'openai':
      translatedText = await callOpenai(prompt, config)
      break
    case 'ollama':
      translatedText = await callOllama(prompt, config)
      break
    default:
      translatedText = text // Should not happen
  }

  return translatedText || text // Fallback to original text if translation fails
}

export async function translateIfNeeded(text, config) {
  if (!text) {
    return text
  }

  if (getLocale() === 'it') {
    return translate(text, config)
  }

  return text
}
