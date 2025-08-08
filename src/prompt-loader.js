import fs from 'fs'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function getPrompt(providerName, promptName) {
  const promptPath = resolve(
    __dirname,
    `../prompts/${providerName}/${promptName}.txt`
  )
  if (fs.existsSync(promptPath)) {
    return fs.readFileSync(promptPath, 'utf-8')
  }
  // Fallback to gemini if the provider-specific prompt doesn't exist
  const fallbackPath = resolve(
    __dirname,
    `../prompts/gemini/${promptName}.txt`
  )
  return fs.readFileSync(fallbackPath, 'utf-8')
}
