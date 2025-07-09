import { writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { t } from '../src/i18n.js';

const template = {
  geminiApiKey: 'your-api-key-here', // Replace with your actual Gemini API key
  geminiModel: 'gemini-2.5-flash', // Default model for Gemini AI
  defaultCommitType: 'feat', // Default commit type for Conventional Commits
  maxSubjectLength: 50, // Maximum length of the commit subject line
  maxDiffLines: 500, // Maximum number of lines in the diff for AI reviews
  minReviewScore: 6, // Minimum review score for AI reviews
}

try {
  console.log(t('initialization'));
  const configPath = resolve(process.cwd(), "gch.config.json");

  if (!existsSync(configPath)) {
    writeFileSync(configPath, JSON.stringify(template, null, 2));
    console.log(
      t('configCreated', { path: process.cwd() })
    );
  } else {
    console.log(
      t('configExists', { path: process.cwd() })
    );
  }
  process.exit(0);
} catch (error) {
  console.error(
    t('configCreationError'),
    error.message
  );
  process.exit(1);
}
