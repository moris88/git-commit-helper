import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { t } from './i18n.js';

// Funzione per caricare la configurazione
export function loadConfig() {
  const localConfigPath = resolve(process.cwd(), 'gch.config.json');
  const globalConfigPath = resolve(homedir(), '.gch.config.json');
  if (existsSync(localConfigPath)) {
    return JSON.parse(readFileSync(localConfigPath, 'utf-8'));
  }
  if (existsSync(globalConfigPath)) {
    return JSON.parse(readFileSync(globalConfigPath, 'utf-8'));
  }
  return null;
}

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
  {
    name: 'breaking',
    description: t('commitTypeBreaking'),
  },
];
