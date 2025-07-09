import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { t } from './i18n.js';

// Funzione per caricare la configurazione
export function loadConfig() {
  const localConfigPath = resolve(process.cwd(), 'gch.config.json');
  if (existsSync(localConfigPath)) {
    return JSON.parse(readFileSync(localConfigPath, 'utf-8'));
  }
  return null;
}

// Costanti di configurazione
export const MIN_REVIEW_SCORE = 7;
export const MIN_TOKEN_LENGTH = 3000;

// Tipi di commit per Conventional Commits
export const COMMIT_TYPES = [
  { name: 'feat', description: t('commitTypeFeat') },
  { name: 'fix', description: t('commitTypeFix') },
  { name: 'docs', description: t('commitTypeDocs') },
  { name: 'style', description: t('commitTypeStyle') },
  { name: 'refactor', description: t('commitTypeRefactor') },
  { name: 'perf', description: t('commitTypePerf') },
  { name: 'test', description: t('commitTypeTest') },
  { name: 'chore', description: t('commitTypeChore') },
  {
    name: 'BREAKING CHANGE',
    description: t('commitTypeBreaking'),
  },
];
