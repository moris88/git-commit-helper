import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { osLocaleSync } from 'os-locale';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let translations = {};

try {
  const locale = osLocaleSync() || 'en-US';
  const lang = locale.split('-')[0];
  const langFile = resolve(__dirname, `../locales/${lang}.json`);

  if (existsSync(langFile)) {
    translations = JSON.parse(readFileSync(langFile, 'utf-8'));
  } else {
    // Fallback to English if the system's language is not supported
    const fallbackFile = resolve(__dirname, '../locales/en.json');
    translations = JSON.parse(readFileSync(fallbackFile, 'utf-8'));
  }
} catch (error) {
  console.error('Failed to load translation files:', error);
  // In case of error, load English as a fallback
  try {
    const fallbackFile = resolve(__dirname, '../locales/en.json');
    translations = JSON.parse(readFileSync(fallbackFile, 'utf-8'));
  } catch (fallbackError) {
    console.error('Failed to load fallback translation file:', fallbackError);
    translations = {}; // No translations available
  }
}

export function t(key, replacements = {}) {
  let translation = translations[key] || key;
  for (const placeholder in replacements) {
    translation = translation.replace(
      new RegExp(`\\{${placeholder}\\}`, 'g'),
      replacements[placeholder]
    );
  }
  return translation;
}
