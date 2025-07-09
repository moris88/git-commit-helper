import fetch from 'node-fetch';
import chalk from 'chalk';
import { getDiff } from './git.js';
import { MIN_TOKEN_LENGTH, MIN_REVIEW_SCORE } from './config.js';
import { t } from './i18n.js';

async function callGemini(prompt, config) {
    try {
      const result = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      const response = await result.json();
      return response?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (error) {
      console.error(chalk.yellow(t('reviewError')), error.message);
      return null;
    }
  }
  

export async function askGeminiForReview(config) {
  const diff = getDiff();
  const reviewPrompt = t('reviewPrompt', {
    minReviewScore: MIN_REVIEW_SCORE,
    diff: diff.substring(0, MIN_TOKEN_LENGTH),
  });

  return callGemini(reviewPrompt, config);
}

export async function askGeminiForGeneratedCommitMessage(config) {
  const diff = getDiff();
  if (!diff) {
    console.log(chalk.yellow(t('noStagedChanges')));
    process.exit(1);
  }

  const prompt = t('commitPrompt', {
    diff: diff.substring(0, MIN_TOKEN_LENGTH),
  });
  
  return callGemini(prompt, config);
}
